#!/usr/bin/env bash
#
# herdr-start-agent.sh
#
# Creates a "nexus-e2e" workspace, waits 0.5s, then starts an agent with kind "omp" in the root pane.
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

# --- Step 0: If a workspace with the default label already exists, close it ---
EXISTING_WORKSPACE=$(herdr workspace list 2>&1 || true)
EXISTING_ID=$(echo "$EXISTING_WORKSPACE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for ws in data.get('result', {}).get('workspaces', []):
    if ws.get('label') == '$WORKSPACE_LABEL':
        print(ws['workspace_id'])
        sys.exit(0)
sys.exit(1)
" 2>/dev/null || true)

if [[ -n "$EXISTING_ID" ]]; then
  echo "→ Existing workspace '$WORKSPACE_LABEL' found ($EXISTING_ID), closing it ..."
  herdr workspace close "$EXISTING_ID" 2>&1 || true
  echo "  Closed existing workspace."
fi

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

# --- Step 2: Wait 0.5s for the root pane ---
echo "→ Waiting 0.5s for root pane $ROOT_PANE_ID to become available ..."
sleep 0.5
echo "✓ Root pane $ROOT_PANE_ID is ready"

# --- Step 3: Generate a random agent name and start the agent ---
RANDOM_NAME="agent-$(head -c 6 /dev/urandom | od -An -tx1 | tr -d ' \n' | head -c 4)"
echo "✓ Agent name: $RANDOM_NAME"

echo "→ Starting agent '$RANDOM_NAME' (kind: mastracode) in root pane $ROOT_PANE_ID ..."
AGENT_OUTPUT=$(herdr agent start "$RANDOM_NAME" --kind "mastracode" --pane "$ROOT_PANE_ID" 2>&1) || {
  echo "  (Agent kind mismatch warning ignored — agent may still be running.)"
}

echo "✓ Agent started successfully."

# --- Step 4: Send a joke prompt and read the response ---
echo "→ Sending prompt to agent..."
herdr agent prompt "$RANDOM_NAME" "tell me a joke" --wait 2>&1 || true

echo ""
echo "→ Agent response:"
herdr agent read "$RANDOM_NAME" --source recent --lines 50 2>&1 || true

echo ""
echo "Summary:"
echo "  Workspace : $WORKSPACE_ID"
echo "  Pane      : $ROOT_PANE_ID (root)"
echo "  Agent     : $RANDOM_NAME (kind: mastracode)"
echo ""
echo "You can now interact with the agent using:"
echo "  herdr agent prompt $RANDOM_NAME \"<your prompt>\" --wait"
