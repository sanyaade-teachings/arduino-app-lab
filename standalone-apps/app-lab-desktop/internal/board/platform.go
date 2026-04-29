package board

import (
	"sync"

	"github.com/arduino/arduino-app-cli/pkg/x/devicetree"
)

var knownBoards = []string{"arduino,imola", "arduino,monza", "arduino"}

var onBoard = sync.OnceValue(func() bool {
	compatible := devicetree.LoadCompatible()
	for _, knownBoard := range knownBoards {
		if compatible.IsCompatibleWith(knownBoard) {
			return true
		}
	}
	return false
})()

func IsSBC() bool {
	return onBoard
}
