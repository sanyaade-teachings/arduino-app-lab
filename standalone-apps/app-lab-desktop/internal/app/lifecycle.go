package app

import (
	"context"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"app-lab-desktop/internal/board"
	"app-lab-desktop/internal/flasher"
	"app-lab-desktop/internal/update"
)

func (a *App) Startup(ctx context.Context) {
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
