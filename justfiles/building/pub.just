# Build the npm release package and publish it to npmjs from the repo root.
# Usage: just pub
# Example: just pub

pub:
    #!/usr/bin/env bash
    set -euo pipefail

    DIST="./apps/tui/dist"
    NPM_PACKAGE_DIR=".release/npm-package"

    # Read the current version from the root package.json (no bump).
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "📦 Publishing opennexus@${PUBLISHED_VERSION}..."

    # Build the TUI bundle.
    echo "🏗️ Building TUI bundle..."
    npx turbo build --filter=@apps/app-tui

    # Prepend shebang so the bundled file is directly executable.
    echo "📝 Prepending shebang..."
    ( echo '#!/usr/bin/env node'; cat "$DIST/index.mjs" ) > "$DIST/index.mjs.tmp"
    mv "$DIST/index.mjs.tmp" "$DIST/index.mjs"
    chmod +x "$DIST/index.mjs"

    # Prepare npm package directory.
    echo "📦 Preparing npm release package..."
    rm -rf "${NPM_PACKAGE_DIR}"
    mkdir -p "${NPM_PACKAGE_DIR}"

    # Copy the bundled files into the package.
    cp "$DIST/index.mjs" "${NPM_PACKAGE_DIR}/index.mjs"
    for f in "$DIST"/*.mjs; do
        [ "$f" = "$DIST/index.mjs" ] && continue
        cp "$f" "${NPM_PACKAGE_DIR}/"
    done
    # Copy any non-.mjs assets (prompts, default-settings, etc.).
    for d in "$DIST"/*/; do
        [ -d "$d" ] || continue
        dirname="$(basename "$d")"
        [ "$dirname" = "prompts" ] && continue
        [ "$dirname" = "default-settings" ] && continue
        cp -r "$d" "${NPM_PACKAGE_DIR}/"
    done
    # Copy prompts and default-settings explicitly.
    [ -d "$DIST/prompts" ] && cp -r "$DIST/prompts" "${NPM_PACKAGE_DIR}/"
    [ -d "$DIST/default-settings" ] && cp -r "$DIST/default-settings" "${NPM_PACKAGE_DIR}/"

    # Write the postinstall script that pulls in runtime dependencies.
    cat > "${NPM_PACKAGE_DIR}/install-deps.mjs" << 'POSTINSTALL'
    import { execSync } from "node:child_process";
    import { readFileSync } from "node:fs";
    import { fileURLToPath } from "node:url";
    import { dirname, join } from "node:path";
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const p = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
    const deps = Object.keys(p.dependencies).filter(d => !p.dependencies[d].startsWith("workspace:"));
    if (deps.length) {
      console.log("[opennexus] Installing runtime dependencies...");
      execSync(`npm install --no-save --force ${deps.join(" ")}`, { stdio: "inherit" });
    }
    POSTINSTALL

    # Copy dependencies from the root package.json as-is.
    DEPS_JSON=$(node -e "const p=require('./package.json'); console.log(JSON.stringify(p.dependencies))")

    # Write package.json for npm publish. The postinstall script pulls
    # in all runtime dependencies after `npm install -g opennexus`.
    cat > "${NPM_PACKAGE_DIR}/package.json" << PKGJSON
    {
      "name": "opennexus",
      "version": "${PUBLISHED_VERSION}",
      "description": "Nexus TUI — terminal interface for AI agents",
      "type": "module",
      "main": "index.mjs",
      "bin": {
        "nexus": "index.mjs"
      },
      "publishConfig": {
        "registry": "https://registry.npmjs.org/",
        "access": "public"
      },
      "scripts": {
        "postinstall": "node install-deps.mjs"
      },
      "dependencies": ${DEPS_JSON},
      "files": ["index.mjs", "*.mjs", "package.json", "install-deps.mjs", "prompts", "default-settings"],
      "os": ["darwin"],
      "cpu": ["arm64", "x64"]
    }
    PKGJSON

    # Publish.
    # Strip workspace:* from package.json so npm doesn't choke on it.
    CLEAN_DEPS=$(node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); const d={}; Object.keys(p.dependencies).filter(k=>!p.dependencies[k].startsWith('workspace:')).forEach(k=>{d[k]=p.dependencies[k]}); console.log(JSON.stringify(d))")
    node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); p.dependencies=JSON.parse(process.argv[1]); require('fs').writeFileSync('package.json',JSON.stringify(p,null,2));" "${CLEAN_DEPS}"
    
    echo "🚀 Publishing npm package..."
    (
        cd "${NPM_PACKAGE_DIR}"
        npm publish
    )

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

    echo "✅ Published opennexus@${PUBLISHED_VERSION} from ${NPM_PACKAGE_DIR}"
