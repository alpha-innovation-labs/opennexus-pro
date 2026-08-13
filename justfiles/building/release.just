# Build the compiled Nexus release and install it globally with npm.
# Usage: just release
# Example: just release

release:
    #!/usr/bin/env bash
    set -euo pipefail

    DIST="./apps/tui/dist"

    # Build the JS bundle (tsdown produces dist/index.mjs).
    npx turbo build --filter=@apps/app-tui

    # npm install -g copies the target file as-is; without a shebang the
    # shell will try to interpret the JS source (and fail).
    # We prepend a shebang to index.mjs and tell npm to use it as the bin.
    # tsdown already puts the entry at dist/index.mjs — we just need
    # `#!/usr/bin/env node` on line 1.
    ( echo '#!/usr/bin/env node'; cat "$DIST/index.mjs" ) > "$DIST/index.mjs.tmp"
    mv "$DIST/index.mjs.tmp" "$DIST/index.mjs"
    chmod +x "$DIST/index.mjs"

    # Write package.json with bin pointing to index.mjs.
    cat > "$DIST/package.json" << 'PKGJSON'
    {
      "name": "nexus-cli",
      "version": "0.2.29",
      "bin": "index.mjs"
    }
    PKGJSON

    # Install globally so 'nexus' is on PATH.
    npm install -g "$DIST"
