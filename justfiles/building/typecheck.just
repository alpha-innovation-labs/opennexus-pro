# ============================================================================
# Typecheck Commands
# ============================================================================

# Run TypeScript typecheck across the entire codebase via Turbo.
typecheck:
	@npx turbo typecheck --output-logs=errors-only
