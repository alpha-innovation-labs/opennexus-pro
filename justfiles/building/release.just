# Package the Nexus app and install the launcher under ~/.local/bin.
# Usage: just release
# Example: just release

release:
    #!/usr/bin/env bash
    set -euo pipefail

    APP_NAME="nexus"
    STAGING_DIR=".release/staging"
    INSTALL_DIR="${HOME}/.local/share/${APP_NAME}"
    BIN_DIR="${HOME}/.local/bin"
    BIN_PATH="${BIN_DIR}/${APP_NAME}"

    if [ "${NEXUS_SKIP_RELEASE_TESTS:-0}" != "1" ]; then
        echo "🧪 Running tests..."
        just test --with-release
    else
        echo "⏭️ Skipping tests inside release e2e harness..."
    fi

    echo "🧹 Cleaning previous release staging..."
    rm -rf "${STAGING_DIR}" "${INSTALL_DIR}"

    echo "📦 Staging runtime bundle..."
    mkdir -p "${STAGING_DIR}" "${INSTALL_DIR}" "${INSTALL_DIR}/.pi/agent" "${BIN_DIR}"
    cp package.json package-lock.json tsconfig.json feature-flags.json "${STAGING_DIR}/"
    cp .pi/settings.json "${STAGING_DIR}/settings.json"
    cp .pi/extensions/neo-editor/editor-triggers.json "${STAGING_DIR}/editor-triggers.json"
    cp -R src "${STAGING_DIR}/src"

    echo "📥 Installing bundle to ${INSTALL_DIR}..."
    cp package.json package-lock.json tsconfig.json feature-flags.json "${INSTALL_DIR}/"
    cp -R "${STAGING_DIR}/src" "${INSTALL_DIR}/src"
    cp "${STAGING_DIR}/settings.json" "${INSTALL_DIR}/.pi/agent/settings.json"
    cp "${STAGING_DIR}/editor-triggers.json" "${INSTALL_DIR}/.pi/agent/editor-triggers.json"

    echo "📥 Installing runtime dependencies..."
    (
        cd "${INSTALL_DIR}"
        npm ci
    )

    echo "🎨 Copying Pi built-in themes for PI_PACKAGE_DIR..."
    mkdir -p "${INSTALL_DIR}/src/modes/interactive/theme"
    cp "${INSTALL_DIR}/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/"*.json "${INSTALL_DIR}/src/modes/interactive/theme/"

    echo "🚀 Writing launcher to ${BIN_PATH}..."
    printf '%s\n' \
        '#!/usr/bin/env bash' \
        'set -euo pipefail' \
        '' \
        'APP_DIR="${HOME}/.local/share/nexus"' \
        'export PI_CODING_AGENT_DIR="${APP_DIR}/.pi/agent"' \
        'export PI_PACKAGE_DIR="${APP_DIR}"' \
        '' \
        'exec "${APP_DIR}/node_modules/.bin/tsx" "${APP_DIR}/src/index.ts" "$@"' \
        > "${BIN_PATH}"
    chmod +x "${BIN_PATH}"

    echo "🔎 Verifying launcher..."
    "${BIN_PATH}" --help >/dev/null

    echo "✅ Installed nexus to ${BIN_PATH}"
