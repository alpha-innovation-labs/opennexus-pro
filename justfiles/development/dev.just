# Run the bundled Pi TUI with the inline Tron extension.
# Usage: just dev [APP_ARGS...]
# Example: just dev adapter status

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

    if [ -n "{{APP_ARGS}}" ]; then
        eval npx --prefix apps/tui tsx -- apps/tui/src/index.ts -- {{APP_ARGS}}
    else
        npx --prefix apps/tui tsx -- apps/tui/src/index.ts
    fi
