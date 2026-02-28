package app

import (
	"app-lab-desktop/internal/auth"
	"app-lab-desktop/internal/board"
	"app-lab-desktop/internal/update"
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	stdruntime "runtime"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"app-lab-desktop/internal/flasher"
)

func (a *App) Startup(ctx context.Context) {

	if stdruntime.GOOS == "linux" {
		if err := registerProtocol(); err != nil {
			runtime.LogErrorf(ctx, "failed to register protocol: %v", err)
		}
	}

	a.ctxHolder.Set(ctx)

	if err := board.InstallToolingIfMissing(ctx); err != nil {
		runtime.LogErrorf(ctx, "failed to initialize board: %v", err)
		// TODO: Display error to user?
	}

	// TODO: this should be either a build or runtime flag
	var userAgent string = fmt.Sprintf("App Lab %s; Desktop", a.version)
	if board.IsSBC() {
		b, err := board.GetSbcBoard(ctx)
		if err != nil {
			runtime.LogErrorf(ctx, "failed to get SBC board: %v", err)
			return
		}
		a.selectedBoard = b
		userAgent = fmt.Sprintf("App Lab %s; %s; %s", a.version, b.Info.BoardName, b.GetOSImageVersion())
	}

	u, err := update.NewUpdater(a.version, userAgent, os.Getenv("ARDUINO_APP_LAB_UPDATE_URL"))
	if err != nil {
		runtime.LogErrorf(ctx, "failed to initialize updater: %v", err)
	}
	a.updater = u

	// checking for updates is best-effort in SBC mode, we just log errors
	// in Desktop mode, `NewVersion` is driven by the UI (see api.go) so we don't call it here
	if board.IsSBC() {
		_, versionErr := u.NewVersion(ctx)
		if versionErr == nil {
			runtime.LogInfof(ctx, "Successfully checked for updates (SBC)")
		} else {
			runtime.LogInfof(ctx, "Failed to check for updates (SBC), skipping...")
		}
	}

	a.AuthFlow = auth.NewFlow()
}

func (a *App) Shutdown(ctx context.Context) {
	daemon, err := flasher.FlashDaemonService()
	if err == nil {
		daemon.DaemonShutDown()
	}
	a.selectedBoard.CloseTunnels(ctx)
}

func (a *App) ctx() context.Context {
	return a.ctxHolder.Get()
}

func (a *App) detectBoards() ([]*board.Board, error) {
	boards, err := board.GetBoards(a.ctx())
	if err != nil {
		return nil, fmt.Errorf("failed to detect boards: %w", err)
	}
	a.detectedBoards = boards
	return boards, nil
}

func (a *App) selectBoard(id string, password string) error {
	for _, b := range a.detectedBoards {
		if b.Id == id {
			if err := b.EstablishConnection(a.ctx(), password); err != nil {
				return fmt.Errorf("failed to select board: %w", err)
			}
			// Important: this is safe because selectedBoard is initialized to a Noop board and changed once,
			// if one day we need to change it multiple times we need to gracefully close the previous board live fields
			// (e.g. Conn, tunnels)
			*a.selectedBoard = *b
			return nil
		}
	}
	return fmt.Errorf("failed to select board: board with id %s not found", id)
}

func isProtocolRegistered(
	execPath string, mimeType string, desktopPath string,
) bool {
	data, err := os.ReadFile(desktopPath)
	if err != nil {
		return false
	}

	hasMimeType := bytes.Contains(data, []byte("MimeType="+mimeType+";"))
	hasCorrectPath := bytes.Contains(data, []byte(execPath))

	return hasMimeType && hasCorrectPath
}

func isDefaultProtocolHandler(
	mimeType string, desktopFileName string,
) bool {
	out, err := exec.Command("xdg-mime", "query", "default", mimeType).Output()
	if err != nil {
		return false
	}
	return strings.Contains(string(out), desktopFileName)
}

func registerProtocol() error {
	desktopFileName := "arduino-app-lab.desktop"
	if board.IsSBC() {
		desktopFileName = "ArduinoAppLab.desktop"
	}
	mimeType := "x-scheme-handler/arduino-app-lab"

	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	execPath, err := os.Executable()
	if err != nil {
		return err
	}

	desktopDir := filepath.Join(home, ".local", "share", "applications")
	desktopPath := filepath.Join(desktopDir, desktopFileName)

	if !isProtocolRegistered(execPath, mimeType, desktopPath) {
		os.MkdirAll(desktopDir, 0755)

		content := fmt.Sprintf(`[Desktop Entry]
Type=Application
Name=Arduino App Lab
Exec="%s" %%u
Terminal=false
MimeType=%s;
Categories=Development;
`, execPath, mimeType)

		if err := os.WriteFile(desktopPath, []byte(content), 0644); err != nil {
			return err
		}

		if cmdPath, err := exec.LookPath("update-desktop-database"); err == nil {
			_ = exec.Command(cmdPath, desktopDir).Run()
		} else {
			fmt.Println("Warning: update-desktop-database not found, skipping cache refresh.")
		}
	}

	if isDefaultProtocolHandler(mimeType, desktopFileName) {
		return nil
	}

	err = exec.Command("xdg-mime", "default", desktopFileName, mimeType).Run()

	return err
}
