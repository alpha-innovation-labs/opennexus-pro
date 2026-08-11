# ============================================================================
# Lint Commands
# ============================================================================

# Run Biome lint across the entire codebase via Turbo.
lint:
	@npx turbo lint --output-logs=errors-only
