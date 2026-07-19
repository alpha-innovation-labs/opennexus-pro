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
import 'justfiles/utilities/update.just'


# ============================================================================
# Default: Show help menu
# ============================================================================

default:
    @just help
