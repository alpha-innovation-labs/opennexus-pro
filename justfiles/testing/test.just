# Run tests, excluding release-dependent e2e coverage by default.
# Usage: just test | just test --with-release
# Example: just test --with-release
#
# Subcommands:
#   list                     — List all discovered tests, grouped
#   run-all                  — Run every selected test file (default)
#   run-group <group-name>   — Run tests matching a describe group
#   run-test <test-name>     — Run a single test by full path
#   help                     — Show this help

# Run tests (without release-dependent e2e tests)
test *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    if [ -n "{{ARGS}}" ]; then
        node scripts/testing/runTests.mjs "{{ARGS}}"
    else
        node scripts/testing/runTests.mjs
    fi

# Run tests including release-dependent e2e tests
test-release *ARGS:
    #!/usr/bin/env bash
    set -euo pipefail

    if [ -n "{{ARGS}}" ]; then
        node scripts/testing/runTests.mjs "--with-release" "{{ARGS}}"
    else
        node scripts/testing/runTests.mjs --with-release
    fi

# List all discovered tests (without release-dependent e2e tests)
test-list:
    node scripts/testing/runTests.mjs list

# List all discovered tests including release-dependent e2e tests
test-release-list:
    node scripts/testing/runTests.mjs list --with-release
