# Run tests, excluding release-dependent e2e coverage by default.
# Usage: just test [FILTER] | just test --with-release
# Example: just test -- filter=auth

[positional-arguments]
test *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    if [ "${1:-}" = "list" ]; then
        npx tsx test/list-tests.ts
    else
        FILTER=""
        if [ $# -gt 0 ]; then
            FILTER="--filter=$1"
        fi
        npx vitest run $FILTER "$@"
    fi
