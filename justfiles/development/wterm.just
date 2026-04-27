# Run a normal interactive shell inside a browser terminal powered by wterm e2e.
# Usage: just wterm [PORT]
# Example: just wterm 4831

wterm PORT="4831":
    #!/usr/bin/env bash
    set -euo pipefail

    WTERM_E2E_PORT={{PORT}} npx tsx apps/wterm-e2e/src/startWtermE2e.ts
