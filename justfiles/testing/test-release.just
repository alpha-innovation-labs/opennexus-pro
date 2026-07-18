# Run tests including release-dependent e2e tests.
# Usage: just test-release [ARGS...]
# Example: just test-release --with-release

test-release *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    if [ -n "{{ARGS}}" ]; then
        node scripts/testing/runTests.mjs "--with-release" "{{ARGS}}"
    else
        node scripts/testing/runTests.mjs --with-release
    fi
