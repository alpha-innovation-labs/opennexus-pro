# Bump the version in the root and apps/tui package.json.
# Usage: just bump
# Example: just bump
# Optionally specify the bump type: major, minor, patch (default: patch).
# Usage: just bump minor

bump:
    #!/usr/bin/env bash
    set -euo pipefail

    BUMP_TYPE="${1:-patch}"

    echo "🔢 Bumping ${BUMP_TYPE} version..."
    npm version "${BUMP_TYPE}" --no-git-tag-version
    npm --prefix apps/tui version "${BUMP_TYPE}" --no-git-tag-version

    NEW_VERSION=$(node -p "require('./package.json').version")
    echo "✅ New version: ${NEW_VERSION}"
