#!/usr/bin/env bash
set -euo pipefail

# Configurable parameters (all required — no defaults)
SESSION="${ZELLIJ_SESSION}"
OUTPUT="${ZELLIJ_OUTPUT}"
PORT=1010
WORKSPACE="${ZELLIJ_WORKSPACE:-$(pwd)}"

# ZELLIJ_COMMANDS is the path to a bash script that runs commands inside the
# zellij session.  The automation script only executes that script.
COMMANDS_SCRIPT="${ZELLIJ_COMMANDS}"

if [ ! -f "$COMMANDS_SCRIPT" ]; then
  echo "ERROR: ZELLIJ_COMMANDS file not found: $COMMANDS_SCRIPT" >&2
  exit 1
fi

# Remove stale temp files from crashed prior runs (race-safe)
rm -f /tmp/zellij-automation-*.kdl 2>/dev/null || true

# Create a temporary config that disables startup noise
TMP_CONFIG=$(mktemp /tmp/zellij-automation-XXXXXX.kdl)
cat > "$TMP_CONFIG" << 'EOF'
web_sharing "on"
show_startup_tips false
show_release_notes false
EOF
trap 'rm -f "$TMP_CONFIG"' EXIT

# ---------------------------------------------------------------------------
# 1. Kill any existing session with this name before creating a new one
# ---------------------------------------------------------------------------
zellij kill-session "$SESSION" || true
sleep 2

# 2. Create the background session with compact layout + web_sharing + no tips
zellij --config "$TMP_CONFIG" --layout compact attach --create-background "$SESSION"

# 3. Export PATH inside the session so commands like 'nexus' are found
zellij --session "$SESSION" action paste -- "export PATH=\"$WORKSPACE:\$PATH\""
zellij --session "$SESSION" action send-keys -- "Enter"
sleep 1

# 4. Execute the user-supplied script inside the zellij session
bash "$COMMANDS_SCRIPT"

# 5. Start the zellij web server in the background (ignore if already running)
zellij web 2>/dev/null &

# 6. Create an auth token and capture it programmatically
TOKEN_OUTPUT=$(zellij web --create-token 2>&1) || true
TOKEN=$(echo "$TOKEN_OUTPUT" \
  | sed -n 's/.*\([0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}\).*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to extract token from: $TOKEN_OUTPUT" >&2
  exit 1
fi

# 7. Open the zellij web client page
agent-browser open "http://127.0.0.1:$PORT/$SESSION"

# 8. Snapshot the page and discover refs programmatically
SNAPSHOT=$(agent-browser snapshot -i 2>&1)

# Parse refs from snapshot output dynamically (macOS grep -P not available)
INPUT_REF=$(echo "$SNAPSHOT" | grep 'textbox' | sed -n 's/.*ref=\(e[0-9]*\).*/\1/p' | head -1)
BUTTON_REF=$(echo "$SNAPSHOT" | grep 'button "AUTHENTICATE"' | sed -n 's/.*ref=\(e[0-9]*\).*/\1/p' | head -1)

if [ -z "$INPUT_REF" ] || [ -z "$BUTTON_REF" ]; then
  echo "ERROR: Could not find refs in snapshot. Output was:" >&2
  echo "$SNAPSHOT" >&2
  exit 1
fi

# 9. Fill the security token text box (discovered ref)
agent-browser fill "@$INPUT_REF" "$TOKEN"

# 10. Click the AUTHENTICATE button (discovered ref)
agent-browser click "@$BUTTON_REF"

# 11. Wait for the authenticated session page to fully load
agent-browser wait --load networkidle

# 12. Take the final screenshot
agent-browser screenshot "$OUTPUT"

# 13. Close the browser session
agent-browser close

# 14. Clean up the zellij session
zellij kill-session "$SESSION" || true

echo "Done — screenshot saved to $OUTPUT"
