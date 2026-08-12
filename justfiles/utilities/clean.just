# Remove build artifacts, dist folders, and turbo cache.
# Usage: just clean
# Example: just clean

clean:
    @echo "Cleaning build artifacts..."
    @find . -type d -name dist -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
    @rm -rf .turbo 2>/dev/null || true
    @echo "Clean complete."
