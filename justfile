# Default: Show help menu
default:
    @just help

# ============================================================================
# Help Command
# ============================================================================

help:
    @echo ""
    @echo "\033[1;36m======================================\033[0m"
    @echo "\033[1;36m      Nexus TUI Awesome Commands     \033[0m"
    @echo "\033[1;36m======================================\033[0m"
    @echo ""
    @echo "\033[1;35m  Most Common Commands:\033[0m"
    @echo "  just \033[0;33mdev\033[0m                     \033[0;32mRun the bundled Pi TUI with Tron\033[0m"
    @echo "  just \033[0;33mweb\033[0m                     \033[0;32mStart and open the landing page web app\033[0m"
    @echo "  just \033[0;33mdev --sessions\033[0m          \033[0;32mList resumable sessions table\033[0m"
    @echo "  just \033[0;33mdev --observations <session-id>\033[0m \033[0;32mPrint observations for a session\033[0m"
    @echo "  just \033[0;33mdev --resume <session-id>\033[0m \033[0;32mOpen a persisted session directly\033[0m"
    @echo "  just \033[0;33mdev-profile\033[0m             \033[0;32mCompare startup profiling with and without --no-extensions\033[0m"
    @echo "  just \033[0;33mwterm\033[0m                  \033[0;32mRun just dev inside a browser terminal\033[0m"
    @echo "  just \033[0;33mtest\033[0m                    \033[0;32mRun the test suite\033[0m"
    @echo "  just \033[0;33mrelease\033[0m                 \033[0;32mBuild and install ~/.local/bin/nexus\033[0m"
    @echo "  just \033[0;33mpub\033[0m                     \033[0;32mBuild and publish the npm release package\033[0m"
    @echo "  just \033[0;33mpub-full\033[0m                \033[0;32mPublish, reinstall, and launch opennexus\033[0m"
    @echo ""
    @echo "\033[1;35m  Utilities:\033[0m"
    @echo "  just \033[0;33mimport-auth\033[0m             \033[0;32mCopy ~/.pi auth.json into Nexus\033[0m"
    @echo "  just \033[0;33mcodexbar-sync\033[0m            \033[0;32mCheck upstream CodexBar usage-provider changes\033[0m"
    @echo "  just \033[0;33muninstall\033[0m               \033[0;32mRemove ~/.local/bin/nexus and its bundle\033[0m"
    @echo "  just \033[0;33mupdate\033[0m                 \033[0;32mRefresh vendor extensions and upgrade packages\033[0m"
    @echo "  just \033[0;33mupgrade\033[0m                \033[0;32mAlias for just update\033[0m"
    @echo ""

# ============================================================================
# Development Commands
# ============================================================================
import 'justfiles/development/dev.just'
import 'justfiles/development/web.just'
import 'justfiles/development/dev-profile.just'
import 'justfiles/development/wterm.just'

# ============================================================================
# Building Commands
# ============================================================================
import 'justfiles/building/release.just'
import 'justfiles/building/pub.just'
import 'justfiles/building/pub-full.just'

# ============================================================================
# Testing Commands
# ============================================================================
import 'justfiles/testing/test.just'

# ============================================================================
# Utility Commands
# ============================================================================
import 'justfiles/utilities/import-auth.just'
import 'justfiles/utilities/codexbar-sync.just'
import 'justfiles/utilities/uninstall.just'
import 'justfiles/utilities/update.just'
import 'justfiles/utilities/upgrade.just'
