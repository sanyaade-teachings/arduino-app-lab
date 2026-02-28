package auth

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	goruntime "runtime"
	"strings"
	"time"

	"github.com/microcosm-cc/bluemonday"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Flow struct {
	srv     *http.Server
	cancel  context.CancelFunc
	timeout time.Duration
}

func NewFlow() *Flow {
	return &Flow{
		timeout: 5 * time.Minute,
	}
}

func (f *Flow) wailsBaseURL(ctx context.Context) string {
	env := runtime.Environment(ctx)

	scheme := "wails"
	if goruntime.GOOS == "windows" {
		scheme = "http"
	}

	host := "wails"
	if env.BuildType != "production" {
		host = "wails.localhost:34115"
	}

	return scheme + "://" + host
}

func (f *Flow) sanitizeInput(rawInput string) string {
	p := bluemonday.StrictPolicy()

	// Sanitize the input
	sanitized := p.Sanitize(rawInput)

	return sanitized
}

func (f *Flow) HandleAuthRedirect(ctx context.Context, rawURL string) {
	rawURL = strings.TrimSpace(rawURL)
	runtime.LogDebugf(ctx, "Processing Link: %s", rawURL)

	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		runtime.LogErrorf(ctx, "Error parsing Link: %v", err)
		return
	}

	code := parsedURL.Query().Get("code")
	state := parsedURL.Query().Get("state")

	sanitizedCode := f.sanitizeInput(code)
	sanitizedState := f.sanitizeInput(state)

	code = url.QueryEscape(sanitizedCode)
	state = url.QueryEscape(sanitizedState)

	if code != "" {
		runtime.WindowShow(ctx)
		runtime.WindowUnminimise(ctx)
		runtime.WindowSetAlwaysOnTop(ctx, true)
		runtime.WindowSetAlwaysOnTop(ctx, false)

		baseURL := f.wailsBaseURL(ctx)

		targetURL := fmt.Sprintf("%s/redirect?code=%s&state=%s", baseURL, code, state)

		runtime.EventsEmit(ctx, "auth-deep-link", targetURL)
	}
}
