package fs

import (
	"app-lab-desktop/internal/board"
	"app-lab-desktop/internal/context"
	"errors"
	"io"
	"io/fs"
	"os"
	"reflect"
	"time"

	"net/http"
	"path"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type fileContentAssetMiddleware struct {
	ctxHolder     *context.Holder
	selectedBoard *board.Board
}

var _ http.Handler = (*fileContentAssetMiddleware)(nil)

const pathPrefix = "/file-content-assets/"
const sshTimeout = 100 * time.Millisecond

func (m *fileContentAssetMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx := m.ctxHolder.Get()
	p := strings.TrimPrefix(r.URL.Path, pathPrefix)
	dir, file := path.Dir(p), path.Base(p)
	runtime.LogInfof(ctx, "Serving asset %s", file)
	f, err := m.getAsset(dir, file)

	if err != nil {
		if errors.Is(err, fs.ErrInvalid) {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		runtime.LogErrorf(ctx, "failed to open app asset %s: %v", p, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer f.Close()

	_, err = io.Copy(w, f)
	if err != nil {
		runtime.LogErrorf(ctx, "failed to read app asset %s: %v", p, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func FileContentAssetMiddleware(ctxHolder *context.Holder, selectedBoard *board.Board) assetserver.Middleware {
	m := &fileContentAssetMiddleware{
		ctxHolder:     ctxHolder,
		selectedBoard: selectedBoard,
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if strings.HasPrefix(r.URL.Path, pathPrefix) {
				m.ServeHTTP(w, r)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (m *fileContentAssetMiddleware) getAsset(dir string, file string) (fs.File, error) {
	selectedConn := m.selectedBoard.Conn

	if reflect.DeepEqual(selectedConn, board.NoopConn()) {
		filesDir := os.DirFS(dir) // <- this prevents navigating outside the assets dir
		return filesDir.Open(file)
	} else {
		remoteFS := getFS(dir, selectedConn)
		selectedConn.Stats("/")    // warm up the connection
		time.Sleep(sshTimeout)     // add a small delay
		return remoteFS.Open(file) // and finally open the file
	}
}
