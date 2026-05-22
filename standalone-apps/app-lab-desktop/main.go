package main

import (
	"app-lab-desktop/internal/app"
	"app-lab-desktop/internal/learn"
	"embed"
	"fmt"
	"os"
	"runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

var (
	//go:embed all:frontend/dist
	assets  embed.FS
	version = "0.0.0-dev"
)

func main() {

	if runtime.GOOS == "linux" {
		// prevent WebKitGTK DMA-BUF renderer issue which cause black square on Linux
		_ = os.Setenv("WEBKIT_DISABLE_DMABUF_RENDERER", "1")
	}

	learnSvc := learn.New()

	app := app.New(version, learnSvc)

	err := wails.Run(&options.App{
		Title:     app.GetTitle(),
		Width:     1024,
		Height:    768,
		MinWidth:  800,
		MinHeight: 600,
		AssetServer: &assetserver.Options{
			Assets:     assets,
			Middleware: app.GetAssetMiddleware(),
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup,
		OnShutdown:       app.Shutdown,
		Bind:             []any{app},
		ErrorFormatter:   app.GetErrorFormatter(),
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
		Linux: &linux.Options{
			WebviewGpuPolicy: linux.WebviewGpuPolicyAlways,
		},
		WindowStartState: options.Maximised,
		Mac: &mac.Options{
			About: &mac.AboutInfo{
				Title:   "Arduino App Lab",
				Message: app.GetAboutMessage(),
			},
			Appearance: mac.NSAppearanceNameDarkAqua,
			OnUrlOpen:  app.OnUrlOpen,
		},
		SingleInstanceLock: getInstanceLockOptions(app),
		DragAndDrop: &options.DragAndDrop{
			EnableFileDrop: true,
		},
	})

	if err != nil {
		panic(fmt.Errorf("failed to run application: %w", err))
	}
}

// We're returning a SingleInstanceLock struct only on non-Mac platforms
// because (on other platforms) it's needed to have a proper custom protocol
// handling during login.
//
// On macOS, the custom protocol URL to log in is handled via the `OnUrlOpen` callback
// so we don't need the HandleSecondInstanceLaunch callback to manage URL parameters.
//
// Moreover, on macOS, blocking the second instance is causing issues with the autoupdate
// because the new updated instance created by `go-updater`
// won't be executed automatically if another instance is already running.
func getInstanceLockOptions(app *app.App) *options.SingleInstanceLock {
	if runtime.GOOS != "darwin" {
		return &options.SingleInstanceLock{
			UniqueId:               "56b1104f-fc4f-4f31-91c6-6447c01338a4",
			OnSecondInstanceLaunch: app.HandleSecondInstanceLaunch,
		}
	}
	return nil
}

func printHelp(cmd string) {
	fmt.Printf("Usage: %s [command]\n", cmd)
	fmt.Println("Commands:")
	fmt.Println("  version   Show the application version")
	fmt.Println("  help      Show this help message")
}
