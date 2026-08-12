# ============================================================================
# Default Command
# ============================================================================

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
import 'justfiles/building/build.just'
import 'justfiles/building/check.just'
import 'justfiles/building/typecheck.just'
import 'justfiles/building/lint.just'

# ============================================================================
# Testing Commands
# ============================================================================
import 'justfiles/testing/test.just'

# ============================================================================
# Utility Commands
# ============================================================================
import 'justfiles/utilities/check-automate.just'
import 'justfiles/utilities/check-release.just'
import 'justfiles/utilities/help.just'
import 'justfiles/utilities/uninstall.just'
import 'justfiles/utilities/upgrade-vendors.just'
import 'justfiles/utilities/sync-vendor.just'
import 'justfiles/utilities/clean.just'

# Default: Show help menu
default:
    @just help
