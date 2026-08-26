# Build the compiled Nexus release and install it locally via npm.
# Usage: just release
# Example: just release

release:
    #!/usr/bin/env bash
    set -euo pipefail

    DIST="./apps/tui/dist"
    NPM_PACKAGE_DIR=".release/npm-package"

    # Read the current version from the root package.json.
    PUBLISHED_VERSION=$(node -p "require('./package.json').version")
    echo "📦 Building local release ${PUBLISHED_VERSION}..."

    # Build the TUI bundle.
    echo "🏗️ Building TUI bundle..."
    npx turbo build --filter=@apps/app-tui

    # Prepend shebang so the bundled file is directly executable.
    echo "📝 Prepending shebang..."
    ( echo '#!/usr/bin/env node'; cat "$DIST/index.mjs" ) > "$DIST/index.mjs.tmp"
    mv "$DIST/index.mjs.tmp" "$DIST/index.mjs"
    chmod +x "$DIST/index.mjs"

    # Prepare npm package directory.
    echo "📦 Preparing npm package..."
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

    # Read deps from apps/tui/package.json, stripping workspace:* entries.
    DEPS_JSON=$(node -e "const p=require('./apps/tui/package.json'); const d={}; Object.keys(p.dependencies).filter(k=>!p.dependencies[k].startsWith('workspace:')).forEach(k=>{d[k]=p.dependencies[k]}); console.log(JSON.stringify(d))")

    # Write package.json (same as pub, but without publishConfig).
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
      "scripts": {
        "postinstall": "node install-deps.mjs"
      },
      "dependencies": ${DEPS_JSON},
      "files": ["index.mjs", "*.mjs", "package.json", "install-deps.mjs", "prompts", "default-settings"],
      "os": ["darwin"],
      "cpu": ["arm64", "x64"]
    }
    PKGJSON

    # Patch highlight.js import paths.
    # highlight.js v11.12.0's exports don't expose ./lib/index.js for ESM,
    # so imports of highlight.js/lib/index.js fail with ERR_PACKAGE_PATH_NOT_EXPORTED.
    # Fix: replace highlight.js/lib/index.js → highlight.js (root export).
    echo "🔧 Patching highlight.js import paths..."
    for f in "${NPM_PACKAGE_DIR}"/*.mjs; do
        [ -f "$f" ] || continue
        sed -i 's|"highlight\.js/lib/index\.js"|"highlight.js"|g' "$f"
    done

    # Install locally (no npm publish).
    # Note: `npm install -g .` skips postinstall scripts, so we run it manually.
    # Also strip workspace:* from package.json before install so npm doesn't choke.
    echo "🚀 Installing locally..."
    (
        cd "${NPM_PACKAGE_DIR}"
        # Create a clean deps list (no workspace:*) for npm.
        CLEAN_DEPS=$(node -e "const p=require('./package.json'); const d={}; Object.keys(p.dependencies).filter(k=>!p.dependencies[k].startsWith('workspace:')).forEach(k=>{d[k]=p.dependencies[k]}); console.log(JSON.stringify(d))")
        node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); p.dependencies=JSON.parse(process.argv[1]); require('fs').writeFileSync('package.json',JSON.stringify(p,null,2));" "${CLEAN_DEPS}"
        npm install -g --force .
        node install-deps.mjs
    )

    echo "✅ Installed opennexus@${PUBLISHED_VERSION} locally"
