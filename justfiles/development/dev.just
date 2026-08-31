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

    # Set process title via `exec -a` so ps shows "mastracode" instead of "npm exec tsx --".
    # This matches the release wrapper behavior (AGENTS.md: Herdr mastracode hack).
    # TODO: Replace with direct "nexus" once Herdr adds support for it.
    # NEXUS_DEV_MODE=1 tells index.ts to set process.title = "mastracode" instead
    # of APP_NAME, ensuring Herdr detects the agent correctly regardless of the
    # process chain (npx -> tsx -> node).
    export NEXUS_DEV_MODE=1
    TSX="$(pnpm root)/.pnpm/tsx@4.23.12/node_modules/tsx/dist/cli.mjs"
    exec -a mastracode "$TSX" apps/tui/src/index.ts "$@"
