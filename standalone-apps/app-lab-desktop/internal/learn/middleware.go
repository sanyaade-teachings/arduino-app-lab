package learn

import (
	"app-lab-desktop/internal/context"
	"io"
	"io/fs"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type learnAssetMiddleware struct {
	ctxHolder *context.Holder
	svc       *Learn
}

var _ http.Handler = (*learnAssetMiddleware)(nil)

const pathPrefix = "/learn-assets/"

func (m *learnAssetMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx := m.ctxHolder.Get()

	// Expected path: /learn-assets/{resourceId}/{assetPath}
	parts := strings.SplitN(strings.TrimPrefix(r.URL.Path, pathPrefix), "/", 2)
	if len(parts) != 2 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	resourceId := parts[0]
	assetPath := parts[1]
	resource, err := m.svc.GetResource(ctx, LearnResourceID(resourceId))
	if err != nil || resource == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	resourceDir := path.Dir(resource.Path)
	path := path.Join(resourceDir, assetPath)
	f, err := learnFS.Open(path)
	if err != nil {
		http.Error(w, "Cannot open learn asset", http.StatusInternalServerError)
		return
	}
	defer f.Close()

	if rs, ok := f.(io.ReadSeeker); ok {
		var mod time.Time
		if fi, err := fs.Stat(learnFS, path); err == nil {
			mod = fi.ModTime()
		}
		w.Header().Set("Cache-Control", "public, max-age=86400")
		http.ServeContent(w, r, path, mod, rs)
		return
	}

	// Fallback
	_, err = io.Copy(w, f)
	if err != nil {
		runtime.LogErrorf(ctx, "Error serving learn asset %s for resource %s: %v", path, resourceId, err)
	}
}

func AssetMiddleware(ctxHolder *context.Holder, svc *Learn) assetserver.Middleware {
	m := &learnAssetMiddleware{
		ctxHolder: ctxHolder,
		svc:       svc,
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
