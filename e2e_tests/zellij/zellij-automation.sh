#!/usr/bin/env bash
#
# zellij-automation.sh — Backwards-compatible shim.
#
# This script delegates to zellij-manager dev for the full automation flow.
# Existing callers (Justfile, CI) continue to work unchanged.
#
# Environment variables:
#   ZELLIJ_SESSION       — Session name (default: "nexus-dev")
#   ZELLIJ_OUTPUT        — Screenshot output path (default: "./zellij-authenticated.png")
#   ZELLIJ_COMMANDS      — Path to commands script (optional)
#   ZELLIJ_WORKSPACE     — Workspace PATH prefix (default: current directory)
#

set -euo pipefail

# Resolve the manager script path relative to this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANAGER="${SCRIPT_DIR}/zellij-manager.ts"

# Validate the manager exists.
if [ ! -f "$MANAGER" ]; then
  echo "ERROR: zellij-manager.ts not found at ${MANAGER}" >&2
  echo "Did you forget to run the build?" >&2
  exit 1
fi

# Delegate to the TypeScript manager's 'dev' subcommand.
# All env vars (ZELLIJ_SESSION, ZELLIJ_OUTPUT, ZELLIJ_COMMANDS, ZELLIJ_WORKSPACE)
# are passed through automatically.
exec tsx "$MANAGER" dev "$@"
