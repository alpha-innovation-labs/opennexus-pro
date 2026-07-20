# ============================================================================
# Development Commands
# ============================================================================
import 'justfiles/development/dev.just'
import 'justfiles/development/web.just'
import 'justfiles/development/dev-profile.just'

# ============================================================================
# Building Commands
# ============================================================================
import 'justfiles/building/release.just'
import 'justfiles/building/pub.just'
import 'justfiles/building/pub-full.just'
import 'justfiles/building/typecheck.just'
import 'justfiles/building/lint.just'

# ============================================================================
# Testing Commands
# ============================================================================
import 'justfiles/testing/test.just'
import 'justfiles/testing/test-release.just'
import 'justfiles/testing/test-list.just'
import 'justfiles/testing/test-release-list.just'

# ============================================================================
# Utility Commands
# ============================================================================
import 'justfiles/utilities/help.just'
import 'justfiles/utilities/import-auth.just'
import 'justfiles/utilities/uninstall.just'
import 'justfiles/utilities/upgrade-vendors.just'

# ============================================================================
# Graphify Commands
# ===========================================================================

# Build a knowledge graph of a project using graphify.
# Usage: just graphify
# Example: just graphify
graphify:
    @echo "\033[1;36mBuilding knowledge graph...\033[0m"
    @if command -v graphify >/dev/null 2>&1; then \
        OPENAI_BASE_URL='http://localhost:4000/v1' \
        OPENAI_API_KEY='sk-1234' \
        OPENAI_MODEL='qwen/qwen3.6-35b-a3b' \
        graphify . && \
        graphify cluster-only . && \
        graphify export html; \
    else \
        echo "graphify not found. Install with: uv tool install graphifyy"; \
    fi

# ============================================================================
# Default: Show help menu
# ============================================================================

default:
    @just help
