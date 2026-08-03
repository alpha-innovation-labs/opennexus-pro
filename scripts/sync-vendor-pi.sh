#!/usr/bin/env bash
# Sync vendor source from the local ../pi clone into packages/pi/.
# The synced source is NOT gitignored so CodeGraph indexes it as part of the main project.
# Usage: scripts/sync-vendor-pi.sh
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PI_CLONE="${PROJECT_ROOT}/../pi"
TARGET_DIR="${PROJECT_ROOT}/packages/pi"

# --- Pre-flight ---
if [ ! -d "$PI_CLONE" ]; then
  echo "ERROR: PI clone not found at $PI_CLONE"
  echo "  Run: git clone https://github.com/earendil-works/pi.git $PI_CLONE"
  exit 1
fi

# Update the clone
echo "Updating ../pi clone..."
cd "$PI_CLONE"
git fetch -q 2>/dev/null || true
git rebase origin/main 2>/dev/null || git rebase 2>/dev/null || true

# Packages to sync (matching the workspace package names)
PACKAGES=(agent ai coding-agent tui)

# Ensure target exists
mkdir -p "$TARGET_DIR"

for pkg in "${PACKAGES[@]}"; do
  SRC_DIR="${PI_CLONE}/packages/${pkg}"
  DST_DIR="${TARGET_DIR}/${pkg}"

  if [ ! -d "$SRC_DIR" ]; then
    echo "  SKIP: $pkg (not found in $PI_CLONE)"
    continue
  fi

  echo "  Syncing $pkg..."

  # Remove old content (preserve the directory itself)
  rm -rf "${DST_DIR:?}/"*

  # Copy the source tree — exclude only node_modules, dist, .git, build caches
  rsync -a --delete \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.turbo' \
    --exclude='.next' \
    --exclude='.output' \
    --exclude='.git' \
    "$SRC_DIR/" "$DST_DIR/"
done

echo "Done. Source synced to $TARGET_DIR"

# Rebuild the single unified CodeGraph index
echo ""
echo "Rebuilding CodeGraph index..."
cd "$PROJECT_ROOT"
codegraph index -q

echo ""
echo "CodeGraph status:"
codegraph status
