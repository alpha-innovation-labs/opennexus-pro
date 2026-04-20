# Remove the installed Nexus launcher and app bundle.
# Usage: just uninstall
# Example: just uninstall

uninstall:
    #!/usr/bin/env bash
    set -euo pipefail

    APP_NAME="nexus"
    INSTALL_DIR="${HOME}/.local/share/${APP_NAME}"
    BIN_PATH="${HOME}/.local/bin/${APP_NAME}"

    echo "🧹 Removing ${BIN_PATH}..."
    rm -f "${BIN_PATH}"

    echo "🧹 Removing ${INSTALL_DIR}..."
    rm -rf "${INSTALL_DIR}"

    echo "✅ Uninstalled nexus"
