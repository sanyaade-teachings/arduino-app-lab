package carrier

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/arduino/arduino-app-cli/pkg/board"
	"github.com/arduino/arduino-app-cli/pkg/board/remote"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.bug.st/f"
)

var linuxConfigCommand = "arduino-linux-config"

func List(ctx context.Context, conn remote.RemoteConn) ([]Carrier, error) {
	cmd := conn.GetCmd(linuxConfigCommand, "carrier", "list", "--format", "json")
	out, err := cmd.Output(ctx)
	if err != nil {
		return []Carrier{}, fmt.Errorf("output failed: %w", err)
	}

	var response CarrierResponse
	if err := json.Unmarshal(out, &response); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w\noutput: %s", err, string(out))
	}

	return response.Carriers, nil
}

func Show(ctx context.Context, conn remote.RemoteConn, carrier string) (ShowResult, error) {
	cmd := conn.GetCmd(linuxConfigCommand, "carrier", "show", carrier, "--format", "json")
	out, err := cmd.Output(ctx)
	if err != nil {
		return ShowResult{}, fmt.Errorf("output failed: %w", err)
	}

	var response ShowResult
	if err := json.Unmarshal(out, &response); err != nil {
		return ShowResult{}, fmt.Errorf("failed to parse JSON: %w\noutput: %s", err, string(out))
	}

	runtime.LogInfo(ctx, string(out))
	return response, nil
}

func Disable(conn remote.RemoteConn, password string, carrier string) (ShowCarrierResult, error) {
	out, err := board.ExecAsRoot(conn, password, linuxConfigCommand, "carrier", "disable", carrier, "--format", "json")
	if err != nil {
		return ShowCarrierResult{}, fmt.Errorf("failed to start: %w", err)
	}

	var response ShowCarrierResult
	if err := json.Unmarshal(out, &response); err != nil {
		return ShowCarrierResult{}, fmt.Errorf("failed to parse JSON: %w\noutput: %s", err, string(out))
	}

	return response, nil
}

type EnableDeviceConfig struct {
	Device string
	Option string
}

func Enable(conn remote.RemoteConn, password string, carrier string, configuration []EnableDeviceConfig) (ShowCarrierResult, error) {
	args := []string{linuxConfigCommand, "carrier", "enable", carrier}
	args = append(args, f.Map(configuration, func(d EnableDeviceConfig) string {
		return fmt.Sprintf("%s=%s", d.Device, d.Option)
	})...)
	args = append(args, "--format", "json")

	out, err := board.ExecAsRoot(conn, password, args...)
	if err != nil {
		return ShowCarrierResult{}, fmt.Errorf("failed to start: %w", err)
	}

	var response ShowCarrierResult
	if err := json.Unmarshal(out, &response); err != nil {
		return ShowCarrierResult{}, fmt.Errorf("failed to parse JSON: %w\noutput: %s", err, string(out))
	}
	return response, nil
}

type ShowResult struct {
	Carriers []ShowCarrierResult `json:"carriers"`
}

type CarrierResponse struct {
	Carriers []Carrier `json:"carriers"`
}

type Carrier struct {
	Name    string         `json:"name"`
	Devices []DeviceResult `json:"devices"`
}

type DeviceResult struct {
	Name             string   `json:"name"`
	DeviceType       string   `json:"device_type"`
	AvailableDevices []string `json:"available_devices"`
}

type ShowCarrierResult struct {
	CarrierName    string               `json:"carrier_name"`
	CurrentEnabled bool                 `json:"current_enabled"`
	NextEnabled    bool                 `json:"next_enabled"`
	CurrentDevices []StatusDeviceResult `json:"current"`
	NextDevices    []StatusDeviceResult `json:"next"`
}

type StatusDeviceResult struct {
	Device     string `json:"device"`
	Option     string `json:"option"`
	DeviceType string `json:"device_type"`
}
