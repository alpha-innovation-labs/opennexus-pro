# Run the bundled Pi TUI with the inline Tron extension.
# Usage: just dev [APP_ARGS]
# Example: just dev "--help"

dev APP_ARGS="":
    #!/usr/bin/env bash
    set -euo pipefail

    if [ -n "{{APP_ARGS}}" ]; then
        npm run dev -- {{APP_ARGS}}
    else
        npm run dev
    fi
