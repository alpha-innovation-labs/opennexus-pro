#!/usr/bin/env bash
#
# test_user_commands.sh — Integration test for user commands directory.
#
# This script creates a temporary user commands directory with a `ping.md`
# command, runs Nexus with it, and validates the output is a valid number.
#
# Usage: bash e2e_tests/scripts/test_user_commands.sh
#

set -euo pipefail

CONFIG_DIR="$(mktemp -d)"
COMMANDS_DIR="${CONFIG_DIR}/commands"
mkdir -p "${COMMANDS_DIR}"

# Create ping.md command
cat > "${COMMANDS_DIR}/ping.md" << 'EOF'
---
description: Pick a random number between 1 and 10
---

# Nexus Ping

When the user types `/ping` with optional arguments:
1. Parse any numeric arguments (default: 1 to 10).
2. Pick a random number in that range.
3. Reply with just the number, nothing else.

Example user input: `/ping`
Expected output: A single number between 1 and 10.

Example user input: `/ping 1 100`
Expected output: A single number between 1 and 100.
EOF

cleanup() {
  rm -rf "${CONFIG_DIR}"
}
trap cleanup EXIT

export NEXUS_CONFIG_DIR="${CONFIG_DIR}"

# Run the full chain: file on disk → CLI injection → Pi parsing → template expansion → agent execution
echo "Running Nexus with user commands directory at: ${COMMANDS_DIR}"
echo "Config dir: ${CONFIG_DIR}"

# Run just dev with /ping prompt — capture output
OUTPUT=$(just dev -p '/ping' 2>&1 || true)

# Extract a number from the output (look for a standalone integer)
NUMBER=$(echo "${OUTPUT}" | grep -oP '(?<=\s)\d+(?=\s|$)' | head -1)

if [ -z "${NUMBER}" ]; then
  echo "FAIL: Could not extract a number from output."
  echo "Output was:"
  echo "${OUTPUT}"
  exit 1
fi

if [ "${NUMBER}" -lt 1 ] || [ "${NUMBER}" -gt 10 ]; then
  echo "FAIL: Number ${NUMBER} is outside expected range [1, 10]."
  exit 1
fi

echo "PASS: User command executed successfully. Output: ${NUMBER}"
exit 0
