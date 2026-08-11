# ============================================================================
# Check Command
# ============================================================================

# Run lint, build, and typecheck across the codebase via Turbo.
# Usage: just check
# Example: just check
check:
	@npx turbo check --output-logs=errors-only
