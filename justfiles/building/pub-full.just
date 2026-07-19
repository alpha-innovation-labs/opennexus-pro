# Uninstall, publish, reinstall, and launch the npm package end-to-end.
# Usage: just pub-full
# Example: just pub-full

pub-full:
    #!/usr/bin/env bash
    set -euo pipefail

    npm uninstall -g opennexus || true
    just pub
    npm cache clean --force
    npm install -g opennexus
    @just dev
