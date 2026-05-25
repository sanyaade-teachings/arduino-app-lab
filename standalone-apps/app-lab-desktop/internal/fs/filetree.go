package fs

import (
	"io/fs"
	"mime"
	"path"
	"slices"
	"sort"
	"sync"
	"time"

	"github.com/arduino/arduino-app-cli/pkg/board/remote"
	"github.com/arduino/arduino-app-cli/pkg/board/remotefs"
)

// maxConcurrentDirReads limits the number of directory listings in-flight at
// once. Keeps us well below the SSH MaxSessions default (10) and avoids
// saturating ADB with parallel subprocesses.
const maxConcurrentDirReads = 8

type FSNode struct {
	Name       string    `json:"name"`
	Path       string    `json:"path"`
	Size       int64     `json:"size"`
	IsDir      bool      `json:"isDir"`
	CreatedAt  string    `json:"createdAt,omitempty"`
	ModifiedAt string    `json:"modifiedAt,omitempty"`
	Extension  *string   `json:"extension,omitempty"`
	MimeType   *string   `json:"mimeType,omitempty"`
	Children   *[]FSNode `json:"children,omitempty"`
}

func getFS(path string, conn remote.RemoteConn) fs.FS {
	return remotefs.New(path, conn)
}

func BuildFileTree(fs fs.FS, ignorePatterns []string) (*FSNode, error) {
	ignoreFn := func(p string) bool {
		return slices.ContainsFunc(ignorePatterns, func(pattern string) bool {
			return path.Base(p) == pattern
		})
	}

	sem := make(chan struct{}, maxConcurrentDirReads)
	return buildFileTreeRecursive(fs, ".", nil, ignoreFn, sem)
}

func GetFileTree(rootPath string, conn remote.RemoteConn) (*FSNode, error) {
	fs := getFS(rootPath, conn)
	return BuildFileTree(fs, []string{".DS_Store", "Thumbs.db", ".cache"})
}

func buildFileTreeRecursive(fss fs.FS, currentPath string, entry fs.DirEntry, ignoreFn func(string) bool, sem chan struct{}) (*FSNode, error) {
	if ignoreFn(currentPath) {
		return nil, nil
	}

	var node FSNode

	if entry != nil && !entry.IsDir() {
		// File node: entry.Info() is served from the parent's cached directory
		// listing — no additional network round-trip needed.
		info, err := entry.Info()
		if err != nil {
			return nil, err
		}
		ext := path.Ext(currentPath)
		mimeType := mime.TypeByExtension(ext)
		if mimeType == "" {
			mimeType = "application/octet-stream"
		}
		node = FSNode{
			Name:       info.Name(),
			Path:       currentPath,
			Size:       info.Size(),
			IsDir:      false,
			CreatedAt:  info.ModTime().Format(time.RFC3339),
			ModifiedAt: info.ModTime().Format(time.RFC3339),
			Extension:  &ext,
			MimeType:   &mimeType,
		}
		return &node, nil
	}

	// Directory node (or root "." where entry is nil): open to read children.
	// Acquire the semaphore so we bound concurrent remote directory listings.
	sem <- struct{}{}
	f, err := fss.Open(currentPath)
	if err != nil {
		<-sem
		return nil, err
	}

	info, err := f.Stat()
	if err != nil {
		<-sem
		return nil, err
	}

	node = FSNode{
		Name:       info.Name(),
		Path:       currentPath,
		Size:       info.Size(),
		IsDir:      info.IsDir(),
		CreatedAt:  info.ModTime().Format(time.RFC3339),
		ModifiedAt: info.ModTime().Format(time.RFC3339),
	}

	entries, err := f.(fs.ReadDirFile).ReadDir(0)
	<-sem // release as soon as listing is done; child traversal runs in parallel
	if err != nil {
		return nil, err
	}

	sortDirEntries(entries)

	// nodeResult carries the outcome for one child slot, keyed by sorted index so
	// we can reconstruct the ordered children slice after all goroutines finish.
	type nodeResult struct {
		node *FSNode
		err  error
	}

	results := make([]nodeResult, len(entries))
	var wg sync.WaitGroup

	for i, e := range entries {
		childPath := path.Join(currentPath, e.Name())
		if e.IsDir() {
			// Process subdirectories concurrently.
			wg.Add(1)
			go func(idx int, dirEntry fs.DirEntry, cp string) {
				defer wg.Done()
				child, err := buildFileTreeRecursive(fss, cp, dirEntry, ignoreFn, sem)
				results[idx] = nodeResult{node: child, err: err}
			}(i, e, childPath)
		} else {
			// File nodes require no network call after the parent listing — handle
			// inline to avoid goroutine overhead.
			child, err := buildFileTreeRecursive(fss, childPath, e, ignoreFn, sem)
			results[i] = nodeResult{node: child, err: err}
		}
	}

	wg.Wait()

	var children []FSNode
	for _, r := range results {
		if r.err != nil || r.node == nil {
			continue
		}
		children = append(children, *r.node)
	}

	node.Children = &children
	return &node, nil
}

// Alphabetical order, directories first
func sortDirEntries(entries []fs.DirEntry) {
	sort.Slice(entries, func(i, j int) bool {
		di := entries[i].IsDir()
		dj := entries[j].IsDir()

		if di != dj {
			return di
		}
		return entries[i].Name() < entries[j].Name()
	})
}
