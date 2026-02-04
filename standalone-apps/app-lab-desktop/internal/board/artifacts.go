package board

import (
	"embed"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
)

//go:embed resources_index/package_index.tar.bz2
var packageIndex embed.FS

func GetFlasherCli() string {
	var name = "arduino-flasher-cli"
	if runtime.GOOS == "windows" {
		name += ".exe"
	}

	srcDir := fmt.Sprintf("resources_%s_%s/%s", runtime.GOOS, runtime.GOARCH, name)

	tmpDir, err := os.MkdirTemp("", "")
	if err != nil {
		panic(err)
	}
	destDir := filepath.Join(tmpDir, name)

	bin, err := packagesFS.Open(srcDir)
	if err != nil {
		panic(err)
	}
	defer bin.Close()

	tmpFile, err := os.Create(destDir)
	if err != nil {
		panic(err)
	}
	defer tmpFile.Close()

	_, err = io.Copy(tmpFile, bin)
	if err != nil {
		panic(err)
	}

	tmpFile.Close() // close before chmod
	err = os.Chmod(destDir, 0755)
	if err != nil {
		panic(err)
	}

	return destDir
}
