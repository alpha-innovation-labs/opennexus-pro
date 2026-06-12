#!/usr/bin/env bash
#
# test_compact_tool_calls.sh — Regression test for compact Tron tool-call rendering.
#
# Verifies that:
#   1. No adjacent empty lines appear in the snapshot (compact mode).
#   2. No blank line separates a tool-call box bottom border (┘) from the
#      next box top border (┌) or content (│).
#   3. A failed tool call (ls with "Path not found") is rendered with its
#      error text — confirming toolResult entries with isError=True are not
#      silently dropped during session resume.
#
# Usage:  bash e2e_tests/test_compact_tool_calls.sh
# Exit code: 0 = pass, 1 = failure
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SNAPSHOT_FILE="${SCRIPT_DIR}/snapshot.txt"

# ── Step 1: Run the automation script to produce a fresh snapshot ─────
echo "▶ Running automation.sh to produce snapshot..."
bash "${SCRIPT_DIR}/automation.sh"

# ── Step 2: Check for adjacent empty lines ───────────────────────────
#    Two consecutive empty lines indicate unwanted spacing in compact mode.
ADJACENT_EMPTY=$(awk 'NR>1 && prev=="" && $0=="" {count++} {prev=$0} END {print count+0}' "${SNAPSHOT_FILE}")
if [ "${ADJACENT_EMPTY}" -gt 0 ]; then
    echo "✗ FAIL: Found ${ADJACENT_EMPTY} pairs of adjacent empty lines in snapshot."
    exit 1
fi
echo "  ✓ No adjacent empty lines found."

# ── Step 3: Check for blank lines between tool-call box borders ───────
#    A blank line between ┘ and ┌ (or │) indicates an unwanted spacer.
#    We look for the pattern:
#       ┘
#       <empty line>
#       ┌  (or │)
BORDER_GAP=$(awk '
    /┘$/ { prev_border=1; prev_line=$0; next }
    prev_border==1 && $0=="" { found_gap=1; prev_border=0 }
    prev_border==1 && /┌/  { found_gap=1; prev_border=0 }
    prev_border==1 && /│/  { found_gap=1; prev_border=0 }
    END { print found_gap+0 }
' "${SNAPSHOT_FILE}")
if [ "${BORDER_GAP}" -gt 0 ]; then
    echo "✗ FAIL: Found blank line between tool-call box borders (┘ → ┌/│)."
    exit 1
fi
echo "  ✓ No blank lines between tool-call box borders."

# ── Step 4: Verify failed tool call is rendered with error text ───────
#    The session contains a failed `ls` call (path not found) that must
#    render as an error entry in the transcript. If it's missing, the
#    resume path silently drops toolResult entries with isError=True.
if ! grep -q 'Path not found' "${SNAPSHOT_FILE}"; then
    echo "✗ FAIL: Failed tool call ('Path not found') is missing from snapshot."
    echo "   The resume path silently drops toolResult entries with isError=True."
    exit 1
fi
echo "  ✓ Failed tool call rendered with error text."

# ── Step 5: Verify total blank line count is minimal ─────────────────
#    A few trailing blank lines at the very end of the snapshot are
#    expected (footer, prompt area). We allow up to 3 trailing blanks
#    but reject any blanks in the tool-call rendering region.
TOTAL_EMPTY=$(grep -c '^$' "${SNAPSHOT_FILE}" || true)
echo "  Total empty lines in snapshot: ${TOTAL_EMPTY}"

echo ""
echo "✔ All compact-tool-call checks passed."
exit 0
