# Remove build artifacts, dist folders, and turbo cache.
# Usage: just clean
# Example: just clean

# Remove all build artifacts AND node_modules directories.
# Usage: just clean-all
# Example: just clean-all

clean-all: clean
    @echo "Removing all node_modules, .next, and out folders..."
    @find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
    @find . -type d -name .next -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    @find . -type d -name out -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    @echo "Clean-all complete."

# Remove build artifacts, dist folders, and turbo cache.
# Usage: just clean
# Example: just clean

clean:
    @echo "Cleaning build artifacts..."
    @find . -type d -name dist -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    @find . -type d -name build -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    @find . -type d -name .turbo -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    @echo "Clean complete."
