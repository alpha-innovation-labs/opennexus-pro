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
    if [ -f .nexus/extensions/neo-editor/editor-triggers.json ]; then
        cp .nexus/extensions/neo-editor/editor-triggers.json "${AGENT_DIR}/editor-triggers.json"
    elif [ ! -f "${AGENT_DIR}/editor-triggers.json" ]; then
        printf '{}\n' > "${AGENT_DIR}/editor-triggers.json"
    fi

    echo "🔎 Verifying launcher..."
    "${BIN_PATH}" --help >/dev/null

    echo "✅ Installed ${APP_NAME} to ${BIN_PATH}"

# Build the npm release package and publish it to npmjs from the repo root.
# Usage: just pub
# Example: just pub

pub:
    #!/usr/bin/env bash
    set -euo pipefail

    NPM_PACKAGE_DIR=".release/npm-package"

    echo "🔢 Bumping patch version..."
    npm version patch --no-git-tag-version

    echo "🏗️ Building native release bundle..."
    npm run build:release

    echo "📦 Preparing npm release package..."
    rm -rf "${NPM_PACKAGE_DIR}"
    node scripts/release/npm-package/createReleaseNpmPackage.mjs

    echo "🚀 Publishing npm package..."
    (
        cd "${NPM_PACKAGE_DIR}"
        npm publish
    )

    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "⏳ Waiting for npm registry to serve ${PUBLISHED_VERSION}..."
    for _ in $(seq 1 30); do
        if [ "$(npm view opennexus version 2>/dev/null || true)" = "${PUBLISHED_VERSION}" ]; then
            break
        fi
        sleep 2
    done

    if [ "$(npm view opennexus version 2>/dev/null || true)" != "${PUBLISHED_VERSION}" ]; then
        echo "❌ npm registry did not surface ${PUBLISHED_VERSION} in time"
        exit 1
    fi

    echo "✅ Published npm package from ${NPM_PACKAGE_DIR}"
    echo "🏷️ Published version ${PUBLISHED_VERSION}"

# Uninstall, publish, reinstall, and launch the npm package end-to-end.
# Usage: just pub-full
# Example: just pub-full

pub-full:
    #!/usr/bin/env bash
    set -euo pipefail

    npm uninstall -g opennexus || true
    just pub
    npm cache clean --force
    npm install -g opennexus
    nexus
