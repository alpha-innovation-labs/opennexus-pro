# Run tests, excluding release-dependent e2e coverage by default.
# Usage: just test | just test --with-release
# Example: just test --with-release

[positional-arguments]
test *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    node scripts/testing/runTests.mjs "$@"
