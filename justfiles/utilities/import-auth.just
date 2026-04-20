# Import Pi auth.json into the installed Nexus agent directory.
# Usage: just import-auth
# Example: just import-auth

import-auth:
    #!/usr/bin/env bash
    set -euo pipefail

    node scripts/auth/importAuth.mjs
