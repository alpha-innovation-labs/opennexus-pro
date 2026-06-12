#!/usr/bin/env bash
#
# yaml_session_runner.sh — Bash wrapper around yaml_session_runner.ts.
#
# Usage:  bash e2e_tests/yaml_session_runner.sh <path-to-yaml>
#
# This wrapper simply forwards to the TypeScript runner so that
# existing bash test scripts can call it without knowing about tsx.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
YAML_PATH="${1:?Usage: bash e2e_tests/yaml_session_runner.sh <path-to-yaml>}"

tsx "${SCRIPT_DIR}/yamlSessionRunner.ts" "${YAML_PATH}"
