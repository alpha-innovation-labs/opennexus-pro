# List all discovered tests including release-dependent e2e tests.
# Usage: just test-release-list
# Example: just test-release-list

test-release-list:
    node scripts/testing/runTests.mjs list --with-release
