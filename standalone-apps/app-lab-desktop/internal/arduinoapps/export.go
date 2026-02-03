package arduinoapps

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func ExportApp(ctx context.Context, orchestratorURL string, appID string, appName string, includeData bool) (string, error) {
	fileName := fmt.Sprintf("%s.zip", appName)

	filePath, err := runtime.SaveFileDialog(ctx, runtime.SaveDialogOptions{
		DefaultFilename: fileName,
		Title:           "Export App",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "ZIP Archive (*.zip)",
				Pattern:     "*.zip",
			},
		},
	})

	if err != nil {
		return "", fmt.Errorf("failed to open save dialog: %w", err)
	}

	if filePath == "" {
		return "", nil
	}

	url := fmt.Sprintf("%s/v1/apps/%s/export?include_data=%t", orchestratorURL, appID, includeData)

	resp, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to download export: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			return "", fmt.Errorf("failed to read error response: %w", err)
		}
		var errorResp map[string]string
		if err := json.Unmarshal(respBody, &errorResp); err == nil {
			if details, ok := errorResp["details"]; ok {
				return "", fmt.Errorf("%s", details)
			}
		}
		return "", fmt.Errorf("export failed with status code: %d", resp.StatusCode)
	}

	out, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	runtime.EventsEmit(ctx, "export:success", map[string]string{
		"appID":    appID,
		"filePath": filePath,
	})

	return filePath, nil
}
