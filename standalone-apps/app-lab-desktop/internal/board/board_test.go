package board

// test with `go test ./internal/board`

import (
	"fmt"
	"testing"

	aBoard "github.com/arduino/arduino-app-cli/pkg/board"
	"github.com/stretchr/testify/assert"
)

func TestOsImageVersion(t *testing.T) {
	source := &aBoard.Board{}

	b, _ := New(source)
	info := b.GetOSImageVersion()
	fmt.Printf("BuildInfo: %s\n", info)
	assert.NotEmpty(t, info, "BuildInfo should not be empty")

}
