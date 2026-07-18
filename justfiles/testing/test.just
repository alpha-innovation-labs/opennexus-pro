# Run tests, excluding release-dependent e2e coverage by default.
# Usage: just test | just test --with-release
# Example: just test --with-release

test *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    if [ -n "{{ARGS}}" ]; then
        node scripts/testing/runTests.mjs "{{ARGS}}"
    else
        node scripts/testing/runTests.mjs
    fi
