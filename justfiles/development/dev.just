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
    exec -a mastracode node node_modules/.pnpm/tsx@4.23.1/node_modules/tsx/dist/cli.mjs -- apps/tui/src/index.ts "$@"
