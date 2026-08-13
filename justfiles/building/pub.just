# Build the npm release package and publish it to npmjs from the repo root.
# Usage: just pub
# Example: just pub

pub:
    #!/usr/bin/env bash
    set -euo pipefail

    DIST="./apps/tui/dist"
    NPM_PACKAGE_DIR=".release/npm-package"

    # Step 1: Bump versions.
    echo "🔢 Bumping version..."
    npm version patch --no-git-tag-version
    npm --prefix apps/tui version patch --no-git-tag-version

    # Step 2: Build the TUI bundle.
    echo "🏗️ Building TUI bundle..."
    npx turbo build --filter=@apps/app-tui

    # Step 3: Prepend shebang so the bundled file is directly executable.
    echo "📝 Prepending shebang..."
    ( echo '#!/usr/bin/env node'; cat "$DIST/index.mjs" ) > "$DIST/index.mjs.tmp"
    mv "$DIST/index.mjs.tmp" "$DIST/index.mjs"
    chmod +x "$DIST/index.mjs"

    # Step 4: Prepare npm package directory.
    echo "📦 Preparing npm release package..."
    rm -rf "${NPM_PACKAGE_DIR}"
    mkdir -p "${NPM_PACKAGE_DIR}"

    # Copy the bundled index.mjs into the package.
    cp "$DIST/index.mjs" "${NPM_PACKAGE_DIR}/index.mjs"
    # Copy any other dist assets (chunks, registerBundledExtensions, etc.).
    for f in "$DIST"/*.mjs; do
        [ "$f" = "$DIST/index.mjs" ] && continue
        cp "$f" "${NPM_PACKAGE_DIR}/"
    done

    # Install runtime dependencies into the package directory so
    # the published package is self-contained (no need for users
    # to run npm install after installing the package).
    DEPS=$(node -e "const p=require('./package.json'); Object.keys(p.dependencies).forEach(d => console.log(d + '@' + p.dependencies[d]))")
    npm install --no-save $DEPS --prefix "${NPM_PACKAGE_DIR}" 2>/dev/null

    # Read the version from root package.json for the published manifest.
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")

    # Write package.json for npm publish.
    cat > "${NPM_PACKAGE_DIR}/package.json" << PKGJSON
    {
      "name": "opennexus",
      "version": "${PUBLISHED_VERSION}",
      "description": "Nexus TUI — terminal interface for AI agents",
      "type": "module",
      "main": "index.mjs",
      "bin": {
        "opennexus": "index.mjs"
      },
      "publishConfig": {
        "registry": "https://registry.npmjs.org/",
        "access": "public"
      },
      "files": ["index.mjs", "*.mjs", "node_modules"],
      "os": ["darwin"],
      "cpu": ["arm64", "x64"]
    }
    PKGJSON

    # Step 5: Publish.
    echo "🚀 Publishing npm package..."
    (
        cd "${NPM_PACKAGE_DIR}"
        npm publish
    )

    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "⏳ Waiting for npm registry to serve ${PUBLISHED_VERSION}..."
    for _ in $(seq 1 60); do
        if [ "$(npm view opennexus version 2>/dev/null || true)" = "${PUBLISHED_VERSION}" ]; then
            break
        fi
        sleep 1
    done

    if [ "$(npm view opennexus version 2>/dev/null || true)" != "${PUBLISHED_VERSION}" ]; then
        echo "⚠️ npm registry did not surface ${PUBLISHED_VERSION} yet — this is normal, it may take a few minutes"
    fi

    echo "✅ Published npm package from ${NPM_PACKAGE_DIR}"
    echo "🏷️ Published version ${PUBLISHED_VERSION}"
