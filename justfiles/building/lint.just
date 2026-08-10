# ============================================================================
# Lint Commands
# ============================================================================

# Run Biome lint + format check across the entire codebase.
lint:
	@echo "\033[1;36mRunning Biome lint check...\033[0m"
	@npx biome check .
