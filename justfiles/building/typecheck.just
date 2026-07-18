# ============================================================================
# Typecheck Commands
# ============================================================================

# Run full TypeScript typecheck across the entire codebase.
typecheck:
	@echo "\033[1;36mRunning TypeScript typecheck...\033[0m"
	@npx tsc --noEmit
