# Run a normal interactive shell inside a browser terminal powered by wterm.
# Usage: just wterm [PORT]
# Example: just wterm 4831

wterm PORT="4831":
    #!/usr/bin/env bash
    set -euo pipefail

    WTERM_DEMO_PORT={{PORT}} npx tsx src/wterm-demo/startWtermDemo.ts
