#!/bin/bash -x

# When you run a GitHub Action inside a container, the $GITHUB_WORKSPACE does not "contain" the .git folder, but
# the root of the repository is guaranteed to be the value of $GITHUB_WORKSPACE
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$GITHUB_WORKSPACE")
cd $ROOT/standalone-apps/app-lab-desktop

./frontend/scripts/download.sh
wails build -tags webkit2_41 -ldflags "-X main.version=0.0.0-$(git rev-parse --short HEAD)" "$@" 2>&1