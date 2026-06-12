#!/usr/bin/env bash
#
# dev_commands.sh — Default zellij commands for `just dev`.
#
# This script runs inside the zellij session created by zellij-manager.
# Replace the contents with whatever commands your test needs.
#

set -euo pipefail

SESSION="nexus-dev"

# Paste "nexus" then press Enter (old inline default, now in a file).
zellij --session "$SESSION" action paste -- "nexus"
zellij --session "$SESSION" action send-keys -- "Enter"
