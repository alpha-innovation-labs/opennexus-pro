# Build the compiled Nexus release and install it globally with npm.
# Usage: just release
# Example: just release

release:
    #!/usr/bin/env bash
    set -euo pipefail

    BINARY="./apps/tui/build/index-darwin-arm64"
    PATCH="/tmp/patch-execpath.mjs"
    SEA_NODE="$HOME/Library/Caches/tsdown/node/v26.7.0/darwin-arm64/node"

    # Create preload script that patches process.execPath so tsdown uses
    # the SEA-compatible binary for --build-sea (it hardcodes process.execPath).
    cat > "$PATCH" << 'PATCH_EOF'
    process.execPath = `${process.env.HOME}/Library/Caches/tsdown/node/v26.7.0/darwin-arm64/node`;
    PATCH_EOF

    rm -f "$BINARY"
    NODE_OPTIONS="--import $PATCH" npx turbo build --filter=@apps/app-tui
    if [ ! -f "$BINARY" ]; then
        echo "ERROR: Binary not found at $BINARY" >&2
        exit 1
    fi
    echo "Release binary built successfully at $BINARY"
