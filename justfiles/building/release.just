# Build the compiled Nexus release and install it globally with npm.
# Usage: just release
# Example: just release

release:
    #!/usr/bin/env bash
    set -euo pipefail

    BINARY="./apps/tui/build/index-darwin-arm64"

    rm -f "$BINARY"
    npx turbo build --filter=@apps/app-tui
    if [ ! -f "$BINARY" ]; then
        echo "ERROR: Binary not found at $BINARY" >&2
        exit 1
    fi
    echo "Release binary built successfully at $BINARY"
