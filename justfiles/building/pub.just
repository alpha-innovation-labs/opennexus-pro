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
