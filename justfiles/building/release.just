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

    mkdir -p "${AGENT_DIR}"

    echo "🔎 Verifying launcher..."
    "${BIN_PATH}" --help >/dev/null

    echo "✅ Installed ${APP_NAME} to ${BIN_PATH}"
