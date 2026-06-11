#!/usr/bin/env bash
#
# automation.sh — Recreate the `nexus-test` tmux session and capture
# a full-page ASCII snapshot for e2e regression testing.
#
# Usage:  bash e2e_tests/automation.sh [resume-id]
#
#   resume-id  Optional.  Defaults to 019eb8e5-3fc3-7105-858a-199c6dff3e8a.
#
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────
SESSION_NAME="nexus-test"
RESUME_ID="${1:-019eb8e5-3fc3-7105-858a-199c6dff3e8a}"
OUTPUT_DIR="$(cd "$(dirname "$0")" && pwd)"
SNAPSHOT_FILE="${OUTPUT_DIR}/snapshot.txt"
NEXUS_CMD="/opt/homebrew/lib/node_modules/opennexus/nexus --resume ${RESUME_ID}"
WAIT_SECONDS=3

# ── Step 1: Kill existing session (if any) ───────────────────────────
tmux kill-session -t "${SESSION_NAME}" 2>/dev/null || true

# ── Step 2: Recreate the session ─────────────────────────────────────
tmux new-session -d -s "${SESSION_NAME}" "${NEXUS_CMD}"

# ── Step 3: Wait for the process to initialise ────────────────────────
sleep "${WAIT_SECONDS}"

# ── Step 4: Capture the full scrollback buffer to a snapshot file ─────
#   -S -  → start from the top of the buffer
#   -E -  → end   at the bottom of  the buffer
#   -p    → print to stdout
tmux capture-pane -t "${SESSION_NAME}" -S - -E - -p > "${SNAPSHOT_FILE}"

echo "Snapshot saved to ${SNAPSHOT_FILE}"
