#!/usr/bin/env bash
# Run `just dev` in a sibling pane to the right, send keys, snapshot, then close.
#
# To customize which keys are sent to the running app:
#   1. Find the line: herdr pane send-keys "$pane_id" "/"
#   2. Replace "/" with any key or sequence you want, e.g.:
#      - herdr pane send-keys "$pane_id" "enter"          (press Enter)
#      - herdr pane send-keys "$pane_id" "ctrl+c"         (Ctrl+C)
#      - herdr pane send-keys "$pane_id" "esc"            (Escape)
#      - herdr pane send-keys "$pane_id" "down" "down" "enter"  (Down, Down, Enter)
#      - herdr pane send-keys "$pane_id" "!" "ls" "enter" (type !ls then Enter)
#   3. The keys are sent literally — use the key names from the CLI reference.
#
# To change the wait times (currently 5s before sending, 1s before snapshot):
#   Adjust the two `sleep` values in the script.
#
# To change how many lines are captured in the snapshot:
#   Change --lines 200 to your desired count.
set -euo pipefail

# 1. Split a pane to the right of the current pane, preserve cwd, don't steal focus
pane_id=$(herdr pane split --current --direction right --cwd "$PWD" --no-focus \
  | jq -r '.result.pane.pane_id')

echo "Split pane: $pane_id"

# 2. Run `just dev` in that pane
herdr pane run "$pane_id" "just dev"

# 3. Wait 5 seconds, then send keys
sleep 5
herdr pane send-keys "$pane_id" "/"
sleep 0.5
herdr pane send-text "$pane_id" "settings"
sleep 0.3
herdr pane send-keys "$pane_id" "enter"
sleep 0.3
herdr pane send-text "$pane_id" "theme"
sleep 0.3
herdr pane send-keys "$pane_id" "enter"

# 4. Wait 1 second, then press enter and snapshot
sleep 1
herdr pane send-keys "$pane_id" "enter"
sleep 0.5
snapshot_dir="$(pwd)/.herdr-snapshots"
mkdir -p "$snapshot_dir"
snapshot_file="$snapshot_dir/snapshot-$(date +%Y%m%d-%H%M%S).txt"
herdr pane read "$pane_id" --source recent-unwrapped --lines 200 > "$snapshot_file"
echo ""
echo "Snapshot saved to: $snapshot_file"

# 5. Close the pane
herdr pane close "$pane_id"
