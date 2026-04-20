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
    @echo "  just \033[0;33mtest\033[0m                    \033[0;32mRun the test suite\033[0m"
    @echo "  just \033[0;33mrelease\033[0m                 \033[0;32mBuild and install ~/.local/bin/nexus\033[0m"
    @echo ""
    @echo "\033[1;35m  Utilities:\033[0m"
    @echo "  just \033[0;33mimport-auth\033[0m             \033[0;32mCopy ~/.pi auth.json into Nexus\033[0m"
    @echo "  just \033[0;33muninstall\033[0m               \033[0;32mRemove ~/.local/bin/nexus and its bundle\033[0m"
    @echo ""

# ============================================================================
# Development Commands
# ============================================================================
import 'justfiles/development/dev.just'

# ============================================================================
# Building Commands
# ============================================================================
import 'justfiles/building/release.just'

# ============================================================================
# Testing Commands
# ============================================================================
import 'justfiles/testing/test.just'

# ============================================================================
# Utility Commands
# ============================================================================
import 'justfiles/utilities/import-auth.just'
import 'justfiles/utilities/uninstall.just'
