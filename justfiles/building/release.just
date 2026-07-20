# Build the compiled Nexus release and install it globally with npm.
# Usage: just release
# Example: just release

release:
    #!/usr/bin/env bash
    set -euo pipefail

    APP_NAME="nexus"
    PREFIX_DIR="${npm_config_prefix:-$(npm prefix -g)}"
    AGENT_DIR="${HOME}/.local/share/${APP_NAME}/agent"
    CONFIG_DIR="${HOME}/.config/${APP_NAME}"
    BIN_PATH="${PREFIX_DIR}/bin/${APP_NAME}"
    NPM_PACKAGE_DIR=".release/npm-package"
    PACK_DIR=".release/packed"

    echo "🏗️ Building native release bundle..."
    npm run build:release

    echo "📦 Preparing npm release package..."
    rm -rf "${NPM_PACKAGE_DIR}" "${PACK_DIR}"
    mkdir -p "${PACK_DIR}"
    node scripts/release/npm-package/createReleaseNpmPackage.mjs

    echo "📦 Packing npm release package..."
    PACKAGE_TGZ=$(npm pack "${NPM_PACKAGE_DIR}" --pack-destination "${PACK_DIR}")

    echo "📦 Installing ${APP_NAME} globally with npm..."
    npm install -g --force "${PACK_DIR}/${PACKAGE_TGZ}"

    mkdir -p "${AGENT_DIR}" "${CONFIG_DIR}"

    # Migrate legacy ~/.config/nexus/settings.json → ~/.config/nexus/config.json
    if [ -f "${CONFIG_DIR}/settings.json" ] && [ ! -f "${CONFIG_DIR}/config.json" ]; then
        echo "  ⏳ Migrating legacy settings.json → config.json"
        cp "${CONFIG_DIR}/settings.json" "${CONFIG_DIR}/config.json"
        rm -f "${CONFIG_DIR}/settings.json"
    fi

    # Ensure editor-triggers.json exists (separate from unified config.json)
    BUNDLED_TRIGERS="packages/extension-core/src/neo-editor/editor-triggers.json"
    if [ -f "${BUNDLED_TRIGERS}" ] && [ ! -f "${CONFIG_DIR}/editor-triggers.json" ]; then
        cp "${BUNDLED_TRIGERS}" "${CONFIG_DIR}/editor-triggers.json"
    elif [ ! -f "${CONFIG_DIR}/editor-triggers.json" ]; then
        printf '{}\n' > "${CONFIG_DIR}/editor-triggers.json"
    fi

    echo "🔎 Verifying launcher..."
    "${BIN_PATH}" --help >/dev/null

    node scripts/telemetry/sendUpdateInstallResult.mjs success

    echo "✅ Installed ${APP_NAME} to ${BIN_PATH}"
