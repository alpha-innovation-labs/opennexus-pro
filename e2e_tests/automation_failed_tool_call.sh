#!/usr/bin/env bash
#
# automation_failed_tool_call.sh — Recreate the `nexus-test` tmux session and
# capture a full-page ASCII snapshot for e2e regression testing of failed
# tool call rendering during session resume.
#
# Usage:  bash e2e_tests/automation_failed_tool_call.sh
#
# This script delegates to the YAML-based session runner.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Generate a temporary YAML config from the existing hardcoded values
YAML_CONFIG=$(mktemp /tmp/nexus-automation-failed-XXXXXX.yaml)
trap "rm -f '${YAML_CONFIG}'" EXIT

cat > "${YAML_CONFIG}" <<YAML
sessionName: nexus-test
command: /opt/homebrew/lib/node_modules/opennexus/nexus --resume 019eb91e-fc84-7793-b510-6ff626445139
waitSeconds: 3
interactions:
YAML

tsx "${SCRIPT_DIR}/scripts/yamlSessionRunner.ts" "${YAML_CONFIG}"
