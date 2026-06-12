#!/usr/bin/env bash
#
# automation.sh — Recreate the `nexus-test` tmux session and capture
# a full-page ASCII snapshot for e2e regression testing.
#
# Usage:  bash e2e_tests/automation.sh [session-name] [resume-id]
#
#   session-name  Optional. Name of the tmux session (default: "nexus-test").
#   resume-id     Optional. Defaults to 019eb8e5-3fc3-7105-858a-199c6dff3e8a.
#
# This script delegates to the YAML-based session runner.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SESSION_NAME="${1:-nexus-test}"
RESUME_ID="${2:-019eb8e5-3fc3-7105-858a-199c6dff3e8a}"

# Generate a temporary YAML config from the existing arguments
YAML_CONFIG=$(mktemp /tmp/nexus-automation-XXXXXX.yaml)
trap "rm -f '${YAML_CONFIG}'" EXIT

cat > "${YAML_CONFIG}" <<YAML
sessionName: ${SESSION_NAME}
command: /opt/homebrew/lib/node_modules/opennexus/nexus --resume ${RESUME_ID}
waitSeconds: 3
interactions:
YAML

tsx "${SCRIPT_DIR}/scripts/yamlSessionRunner.ts" "${YAML_CONFIG}"
