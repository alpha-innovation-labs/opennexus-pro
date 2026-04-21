# Run the bundled Pi TUI with the inline Tron extension.
# Usage: just dev [APP_ARGS...]
# Example: just dev adapter status

dev *APP_ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    export NEXUS_AGENT_LABEL="Nexus dev"

    if [ -f .env ]; then
        set -a
        source .env
        set +a
    fi

    if [ "{{APP_ARGS}}" != "" ]; then
        npm run dev -- {{APP_ARGS}}
    else
        npm run dev
    fi
