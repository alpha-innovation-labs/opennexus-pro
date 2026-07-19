# Run tests including release-dependent e2e tests.
# Usage: just test-release [ARGS...]
# Example: just test-release --with-release

[positional-arguments]
test-release *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    node scripts/testing/runTests.mjs "--with-release" "$@"
