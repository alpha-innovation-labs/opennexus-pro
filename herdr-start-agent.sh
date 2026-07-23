#!/usr/bin/env bash
#
# herdr-start-agent.sh
#
# Creates a "nexus-e2e" workspace, polls until the root pane is available,
# resolves what `just dev` actually runs, aliases "pi" to that binary,
# starts an agent with kind "pi", then restores the original mapping.
#
# Usage: ./herdr-start-agent.sh
# (No arguments needed — all defaults are hardcoded for e2e testing.)

set -euo pipefail

# --- Validate we are inside Herdr ---
if [[ "${HERDR_ENV:-}" != "1" ]]; then
  echo "ERROR: Not running inside a Herdr-managed pane. Set HERDR_ENV=1 and retry." >&2
  exit 1
fi

WORKSPACE_LABEL="nexus-e2e"

# --- Step 0: Resolve what `just dev` actually runs ---
# We need to find the real executable that `just dev` invokes so we can
# temporarily alias "pi" to it before starting the agent.
JUST_DEV_OUTPUT=$(just -n dev 2>&1 || true)

# Extract the final executable from the justfile output.
# `just dev` outputs something like:
#   npx --prefix apps/tui tsx -- apps/tui/src/index.ts "$@"
# We need the last executable that actually runs the app.
# For nexus: it's `npx` → `tsx` → `tsx` is the runner.
# Common patterns: "bun run", "node", "npx", "tsx", "python".
REAL_BINARY=""
if echo "$JUST_DEV_OUTPUT" | grep -q "bun"; then
  REAL_BINARY="bun"
elif echo "$JUST_DEV_OUTPUT" | grep -q "tsx"; then
  REAL_BINARY="tsx"
elif echo "$JUST_DEV_OUTPUT" | grep -q "npx"; then
  # npx is a wrapper; the real runner is what npx resolves to.
  # Extract the command after npx flags.
  REAL_BINARY=$(echo "$JUST_DEV_OUTPUT" | grep -oP 'npx\b[^ ]* \K\S+' | head -1)
  # If that's tsx, use tsx; otherwise use npx.
  if echo "$REAL_BINARY" | grep -q "tsx"; then
    REAL_BINARY="tsx"
  else
    REAL_BINARY="npx"
  fi
elif echo "$JUST_DEV_OUTPUT" | grep -q "node"; then
  REAL_BINARY="node"
else
  # Fallback: extract the first command word.
  REAL_BINARY=$(echo "$JUST_DEV_OUTPUT" | grep -oP '^\s*\K\S+' | head -1)
fi

if [[ -z "$REAL_BINARY" ]]; then
  echo "ERROR: Could not determine binary from `just -n dev`." >&2
  echo "Output was: $JUST_DEV_OUTPUT" >&2
  exit 1
fi

echo "  Detected binary: $REAL_BINARY"

# --- Step 1: Create workspace ---
CREATE_OUTPUT=$(herdr workspace create --label "$WORKSPACE_LABEL" --no-focus 2>&1) || {
  echo "ERROR: Failed to create workspace." >&2
  echo "$CREATE_OUTPUT" >&2
  exit 1
}

WORKSPACE_ID=$(echo "$CREATE_OUTPUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['workspace']['workspace_id'])")
ROOT_PANE_ID=$(echo "$CREATE_OUTPUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['root_pane']['pane_id'])")

echo "✓ Workspace created: $WORKSPACE_ID (label: $WORKSPACE_LABEL)"
echo "✓ Root pane: $ROOT_PANE_ID"

# --- Step 2: Split a new pane (root pane is occupied by init process) ---
SPLIT_OUTPUT=$(herdr pane split --pane "$ROOT_PANE_ID" --direction right --no-focus 2>&1) || {
  echo "ERROR: Failed to split pane." >&2
  echo "$SPLIT_OUTPUT" >&2
  exit 1
}

NEW_PANE_ID=$(echo "$SPLIT_OUTPUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['pane']['pane_id'])")
echo "✓ New pane: $NEW_PANE_ID"

# --- Step 3: Poll until the new pane is an available shell ---
MAX_WAIT=30  # seconds (in 10ths)
ELAPSED=0
POLL_INTERVAL=1  # 0.1s = 1 tenth of a second

echo "→ Waiting for pane $NEW_PANE_ID to become available ..."
while [[ $ELAPSED -lt $MAX_WAIT ]]; do
  STATUS_OUTPUT=$(herdr pane get "$NEW_PANE_ID" 2>&1) || true
  AGENT_STATUS=$(echo "$STATUS_OUTPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('result',{}).get('pane',{}).get('agent_status',''))" 2>/dev/null || true)

  if [[ "$AGENT_STATUS" == "unknown" || "$AGENT_STATUS" == "idle" ]]; then
    REAL_SECONDS=$(python3 -c "print(round($ELAPSED / 10.0, 1))")
    echo "✓ Pane $NEW_PANE_ID is available after ${REAL_SECONDS}s"
    break
  fi

  sleep 0.1
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

REAL_SECONDS=$(python3 -c "print(round($MAX_WAIT / 10.0, 1))")
if [[ $ELAPSED -ge $MAX_WAIT ]]; then
  echo "ERROR: Pane $NEW_PANE_ID did not become available within ${REAL_SECONDS}s." >&2
  exit 1
fi

# --- Step 4: Temporarily alias "pi" to the real binary ---
# Herdr's agent kind maps "pi" → the "pi" executable.
# We need to make "pi" resolve to whatever `just dev` actually runs.
# Save the current "pi" path so we can restore it.
ORIGINAL_PI_PATH=$(which pi 2>/dev/null || true)

# Create a temporary wrapper script that calls the real binary.
WRAPPER_DIR=$(mktemp -d)
WRAPPER_SCRIPT="$WRAPPER_DIR/pi-wrapper"
cat > "$WRAPPER_SCRIPT" <<WRAPPER_EOF
#!/usr/bin/env bash
exec $REAL_BINARY "\$@"
WRAPPER_EOF
chmod +x "$WRAPPER_SCRIPT"

# Temporarily prepend the wrapper dir to PATH so "pi" resolves to our wrapper.
export PATH="$WRAPPER_DIR:$PATH"

# --- Step 5: Generate a random agent name and start the agent ---
RANDOM_NAME="agent-$(head -c 6 /dev/urandom | od -An -tx1 | tr -d ' \n' | head -c 4)"
echo "✓ Agent name: $RANDOM_NAME"

echo "→ Starting agent '$RANDOM_NAME' (kind: pi) in pane $NEW_PANE_ID ..."
AGENT_OUTPUT=$(herdr agent start "$RANDOM_NAME" --kind "pi" --pane "$NEW_PANE_ID" 2>&1) || {
  # Clean up wrapper before exiting.
  rm -rf "$WRAPPER_DIR"
  echo "ERROR: Failed to start agent." >&2
  echo "$AGENT_OUTPUT" >&2
  exit 1
}

echo "✓ Agent started successfully."

# --- Step 6: Restore original "pi" path ---
if [[ -n "$ORIGINAL_PI_PATH" ]]; then
  # Remove our wrapper dir from PATH, restoring the original "pi".
  export PATH=$(echo "$PATH" | sed "s|$WRAPPER_DIR:||g")
  echo "  Restored original 'pi' path: $ORIGINAL_PI_PATH"
else
  # There was no "pi" before — remove the wrapper dir entirely.
  export PATH=$(echo "$PATH" | sed "s|$WRAPPER_DIR:||g")
  rm -rf "$WRAPPER_DIR"
  echo "  No original 'pi' — cleaned up wrapper."
fi

echo ""
echo "Summary:"
echo "  Workspace : $WORKSPACE_ID"
echo "  Pane      : $ROOT_PANE_ID"
echo "  Agent     : $RANDOM_NAME (kind: pi → resolved to $REAL_BINARY)"
echo ""
echo "You can now interact with the agent using:"
echo "  herdr agent prompt $RANDOM_NAME \"<your prompt>\" --wait"
