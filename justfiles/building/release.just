# Package the Nexus app and install the launcher under ~/.local/bin.
# Usage: just release
# Example: just release

release:
    #!/usr/bin/env bash
    set -euo pipefail

    APP_NAME="nexus"
    BUNDLE_DIR=".release/bundle"
    STAGING_DIR=".release/staging"
    INSTALL_DIR="${HOME}/.local/share/${APP_NAME}"
    BIN_DIR="${HOME}/.local/bin"
    BIN_PATH="${BIN_DIR}/${APP_NAME}"

    echo "🧹 Cleaning previous release staging..."
    rm -rf "${STAGING_DIR}"

    echo "🏗️ Building native release bundle..."
    npm run build:release

    echo "📦 Staging runtime bundle..."
    mkdir -p "${STAGING_DIR}" "${STAGING_DIR}/agent" "${INSTALL_DIR}" "${INSTALL_DIR}/agent" "${BIN_DIR}"
    cp -R "${BUNDLE_DIR}/." "${STAGING_DIR}/"
    cp .nexus/extensions/neo-editor/editor-triggers.json "${STAGING_DIR}/agent/editor-triggers.json"

    echo "📥 Installing bundle to ${INSTALL_DIR}..."
    rm -rf \
        "${INSTALL_DIR}/assets" \
        "${INSTALL_DIR}/export-html" \
        "${INSTALL_DIR}/runtime" \
        "${INSTALL_DIR}/theme" \
        "${INSTALL_DIR}/defaults" \
        "${INSTALL_DIR}/nexus" \
        "${INSTALL_DIR}/package.json"
    cp -R "${STAGING_DIR}/." "${INSTALL_DIR}/"

    echo "🚀 Writing launcher to ${BIN_PATH}..."
    printf '%s\n' \
        '#!/usr/bin/env bash' \
        'set -euo pipefail' \
        '' \
        'APP_DIR="${HOME}/.local/share/nexus"' \
        'export NEXUS_CODING_AGENT_DIR="${APP_DIR}/agent"' \
        'export PI_CODING_AGENT_DIR="${APP_DIR}/agent"' \
        'export PI_PACKAGE_DIR="${APP_DIR}"' \
        '' \
        'exec "${APP_DIR}/nexus" "$@"' \
        > "${BIN_PATH}"
    chmod +x "${BIN_PATH}"

    echo "🔎 Verifying launcher..."
    "${BIN_PATH}" --help >/dev/null

    echo "✅ Installed native nexus bundle to ${BIN_PATH}"
