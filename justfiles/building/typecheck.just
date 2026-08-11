# Run TypeScript typecheck across the entire codebase via Turbo.
# Usage: just typecheck
# Example: just typecheck

typecheck:
    @npx turbo typecheck --output-logs=errors-only
