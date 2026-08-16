# Run the bundled Pi TUI with the inline Tron extension.
# Usage: just dev [APP_ARGS...]
# Example: just dev adapter status

[positional-arguments]
dev *APP_ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    export NEXUS_AGENT_LABEL="Nexus dev"

    # Unset PI_PACKAGE_DIR so theme resolution uses local node_modules, not the global install
    unset PI_PACKAGE_DIR

    if [ -f .env ]; then
        set -a
        source .env
        set +a
    fi

    # Start watch mode in PM2 if not already running.
    if pm2 info nexus-watch >/dev/null 2>&1; then
        echo "watch is running (PM2)"
    else
        pm2 start apps/tui/ecosystem.config.cjs --only nexus-watch
        sleep 5  # give watch time to do initial build
        echo "watch started (PM2)"
    fi

    # Ensure the initial bundle exists (build if watch hasn't produced it yet).
    if [ ! -f apps/tui/dist/index.mjs ]; then
        npx turbo build --filter=@apps/app-tui
    fi

    # Patch highlight.js import paths (v11.12.0's ESM exports don't expose ./lib/index.js).
    for f in apps/tui/dist/*.mjs; do
        [ -f "$f" ] || continue
        sed -i '' 's|"highlight\.js/lib/index\.js"|"highlight.js"|g' "$f"
    done

    # Set process title via `exec -a` so ps shows "mastracode".
    # This matches the release wrapper behavior (AGENTS.md: Herdr mastracode hack).
    # Stop the watcher when this script exits.
    trap 'pm2 delete nexus-watch 2>/dev/null' EXIT
    exec -a mastracode node apps/tui/dist/index.mjs "$@"
