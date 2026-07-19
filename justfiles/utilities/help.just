# Show the Nexus TUI Awesome help menu.
# Usage: just help
# Example: just help

help:
    @echo ""
    @echo "\033[1;36m======================================\033[0m"
    @echo "\033[1;36m      Nexus TUI Awesome Commands     \033[0m"
    @echo "\033[1;36m======================================\033[0m"
    @echo ""
    @echo "\033[1;35m  Most Common Commands:\033[0m"
    @echo "  just \033[0;33mdev\033[0m                     \033[0;32mRun the bundled Pi TUI with Tron\033[0m"
    @echo "  just \033[0;33mweb\033[0m                     \033[0;32mStart and open the landing page web app\033[0m"
    @echo "  just \033[0;33mdev-profile\033[0m             \033[0;32mCompare startup profiling with and without --no-extensions\033[0m"
    @echo "  just \033[0;33mwterm\033[0m                  \033[0;32mRun just dev inside a browser terminal\033[0m"
    @echo "  just \033[0;33mtest\033[0m                    \033[0;32mRun the test suite (no release e2e)\033[0m"
    @echo "  just \033[0;33mtest-release\033[0m            \033[0;32mRun tests including release e2e\033[0m"
    @echo "  just \033[0;33mtest-list\033[0m               \033[0;32mList all tests (no release e2e)\033[0m"
    @echo "  just \033[0;33mtest-release-list\033[0m      \033[0;32mList all tests (with release e2e)\033[0m"
    @echo "  just \033[0;33mrelease\033[0m                 \033[0;32mBuild and install ~/.local/bin/nexus\033[0m"
    @echo "  just \033[0;33mpub\033[0m                     \033[0;32mBuild and publish the npm release package\033[0m"
    @echo "  just \033[0;33mpub-full\033[0m                \033[0;32mPublish, reinstall, and launch opennexus\033[0m"
    @echo ""
    @echo "\033[1;35m  Utilities:\033[0m"
    @echo "  just \033[0;33mimport-auth\033[0m             \033[0;32mCopy ~/.pi auth.json into Nexus\033[0m"
    @echo "  just \033[0;33muninstall\033[0m               \033[0;32mRemove ~/.local/bin/nexus and its bundle\033[0m"
    @echo "  just \033[0;33mupgrade-vendors\033[0m         \033[0;32mRefresh vendor extensions and upgrade packages\033[0m"
    @echo ""
