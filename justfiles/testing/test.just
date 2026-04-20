# Run tests, excluding release-dependent e2e coverage by default.
# Usage: just test | just test --with-release
# Example: just test --with-release

test *ARGS:
    node scripts/testing/runTests.mjs {{ARGS}}
