#!/usr/bin/env bash
# Debug script to prove whether applyStartupHelpSilencePatch is working.
#
# This script:
#   1. Runs `just dev` in a dedicated pane
#   2. Captures the raw output
#   3. Checks whether the startup banner text appears
#   4. Reports PASS or FAIL
set -euo pipefail

SNAPSHOT_DIR="$(pwd)/.herdr-snapshots"
mkdir -p "$SNAPSHOT_DIR"
SNAPSHOT_FILE="$SNAPSHOT_DIR/silence-test-$(date +%Y%m%d-%H%M%S).txt"

# --- Phase 1: Run just dev in a pane ---
echo "=== Phase 1: Starting Nexus TUI ==="
pane_id=$(herdr pane split --current --direction right --cwd "$PWD" --no-focus \
  | jq -r '.result.pane.pane_id')

echo "Split pane: $pane_id"

# Run `just dev` in that pane
herdr pane run "$pane_id" "just dev"

# Wait for the app to initialize
sleep 5

# --- Phase 2: Snapshot the output ---
echo "=== Phase 2: Capturing snapshot ==="
herdr pane send-keys "$pane_id" "enter"
sleep 1
herdr pane read "$pane_id" --source recent-unwrapped --lines 300 > "$SNAPSHOT_FILE"
echo ""
echo "Snapshot saved to: $SNAPSHOT_FILE"
echo ""

# --- Phase 3: Analyze whether the startup banner is present ---
echo "=== Phase 3: Analysis ==="

# Check 1: Does the banner text appear?
if grep -q "pi v0.84.1" "$SNAPSHOT_FILE"; then
  echo "❌ FAIL: Startup banner IS present (banner text 'pi v0.84.1' found)"
  BANNER_PRESENT=true
else
  echo "✅ PASS: Startup banner is NOT present (no 'pi v0.84.1' found)"
  BANNER_PRESENT=false
fi

# Check 2: Does "Press ctrl+o" appear?
if grep -q "Press ctrl" "$SNAPSHOT_FILE"; then
  echo "❌ FAIL: 'Press ctrl+o' instruction IS present"
  PRESS_CTRL_PRESENT=true
else
  echo "✅ PASS: 'Press ctrl+o' instruction is NOT present"
  PRESS_CTRL_PRESENT=false
fi

# Check 3: Does "[Context]" appear (loaded resources listing)?
if grep -q "\[Context\]" "$SNAPSHOT_FILE"; then
  echo "❌ FAIL: '[Context]' section IS present"
  CONTEXT_SECTION_PRESENT=true
else
  echo "✅ PASS: '[Context]' section is NOT present"
  CONTEXT_SECTION_PRESENT=false
fi

# Check 4: Does "[Skills]" appear?
if grep -q "\[Skills\]" "$SNAPSHOT_FILE"; then
  echo "❌ FAIL: '[Skills]' section IS present"
  SKILLS_SECTION_PRESENT=true
else
  echo "✅ PASS: '[Skills]' section is NOT present"
  SKILLS_SECTION_PRESENT=false
fi

# Check 5: Does "[Extensions]" appear?
if grep -q "\[Extensions\]" "$SNAPSHOT_FILE"; then
  echo "❌ FAIL: '[Extensions]' section IS present"
  EXTENSIONS_SECTION_PRESENT=true
else
  echo "✅ PASS: '[Extensions]' section is NOT present"
  EXTENSIONS_SECTION_PRESENT=false
fi

# Check 6: Does "[Themes]" appear?
if grep -q "\[Themes\]" "$SNAPSHOT_FILE"; then
  echo "❌ FAIL: '[Themes]' section IS present"
  THEMES_SECTION_PRESENT=true
else
  echo "✅ PASS: '[Themes]' section is NOT present"
  THEMES_SECTION_PRESENT=false
fi

echo ""
echo "=== Full snapshot contents ==="
cat "$SNAPSHOT_FILE"
echo ""

# Check 7: Print the patch source to verify current state
echo "=== Current patch source (applyStartupHelpSilencePatch.ts) ==="
cat packages/pi-platform/src/applyStartupHelpSilencePatch.ts
echo ""

# Check 8: Verify the actual method name in the installed pi-coding-agent
echo "=== Verifying InteractiveMode method names ==="
PI_ROOT=$(pnpm root)
PI_PKG=$(find "$PI_ROOT/.pnpm" -path "*@earendil-works+pi-coding-agent*" -name "interactive-mode.js" 2>/dev/null | head -1)
if [ -n "$PI_PKG" ]; then
  echo "Found interactive-mode.js at: $PI_PKG"
  echo "Methods found:"
  grep -n "async init\|async run\|async initialize\|prototype.init\|prototype.initialize" "$PI_PKG" | head -10
else
  echo "Could not find interactive-mode.js"
fi

# Clean up
echo ""
echo "=== Closing pane ==="
herdr pane close "$pane_id" 2>/dev/null || true

echo ""
if [ "$BANNER_PRESENT" = true ]; then
  echo "RESULT: FAIL — the startup banner is still showing."
  exit 1
else
  echo "RESULT: PASS — the startup banner is suppressed."
  exit 0
fi
