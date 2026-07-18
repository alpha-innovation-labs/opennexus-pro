# List all discovered tests (without release-dependent e2e tests).
# Usage: just test-list
# Example: just test-list

test-list:
    node scripts/testing/runTests.mjs list
