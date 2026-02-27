package wifi

import (
	"app-lab-desktop/internal/network"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/arduino/arduino-app-cli/pkg/board/remote"
)

func Disconnect(ctx context.Context, conn remote.RemoteConn) error {
	if conn == nil {
		return fmt.Errorf("missing connection")
	}

	nm := &network.Manager{
		Timeout: 60 * time.Second,
		Conn:    conn,
	}

	out, err := nm.Run(ctx, "-t", "-f", "TYPE,NAME", "connection", "show", "--active")
	if err != nil {
		return err
	}

	var targetSSID string
	lines := strings.Split(string(out), "\n")
	for _, line := range lines {
		if strings.Contains(line, "802-11-wireless") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				targetSSID = parts[1]
				break
			}
		}
	}

	if targetSSID != "" {
		_, err = nm.Run(ctx, "connection", "delete", targetSSID)
		if err != nil {
			return fmt.Errorf("failed to delete Wi-Fi connection: %w", err)
		}
	} else {
		return fmt.Errorf("no active Wi-Fi connection found")
	}

	return nil
}
