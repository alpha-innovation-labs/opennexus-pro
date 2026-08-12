# Build the compiled Nexus release and install it globally with npm.
# Usage: just release
# Example: just release

release:
    #!/usr/bin/env bash
    set -euo pipefail

    APP_NAME="nexus"
    PREFIX_DIR="${npm_config_prefix:-$(npm prefix -g)}"
    AGENT_DIR="${HOME}/.local/share/${APP_NAME}/agent"
    BIN_PATH="${PREFIX_DIR}/bin/${APP_NAME}"
    NPM_PACKAGE_DIR=".release/npm-package"
    PACK_DIR=".release/packed"

    # Step 1: Build the TUI with tsdown (bundles TUI + all workspace packages into a single ESM file).
    echo "🔨 Building TUI with tsdown..."
    npx tsdown --config tsdown.config.ts

    # Step 2: Verify the entry point exists
    ENTRY_POINT="dist/index-tui.js"
    if [ ! -f "$ENTRY_POINT" ]; then
        echo "❌ Build failed: $ENTRY_POINT not found"
        exit 1
    fi
    echo "✅ Entry point created at $ENTRY_POINT"

    # Step 3: Prepend shebang so the bundled file is directly executable.
    sed -i '' '1s/^/#!\/usr\/bin\/env node\n/' "$ENTRY_POINT"
    chmod +x "$ENTRY_POINT"
    echo "✅ Shebang prepended to $ENTRY_POINT"

    # Step 4: Install the release globally.
    # The bundled file is a self-contained ESM executable — runs directly as `#!/usr/bin/env node`.
    echo "📦 Installing release binary..."
    mkdir -p "${PREFIX_DIR}/bin"
    cp "$ENTRY_POINT" "${BIN_PATH}"
    chmod +x "${BIN_PATH}"
    echo "✅ Installed to ${BIN_PATH}"
