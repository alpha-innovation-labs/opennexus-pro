# Herdr e2e agent commands.
# Usage: just agent-e2e <command> [ARGS...]
# Example: just agent-e2e setup --label my-workspace

[positional-arguments]
agent-e2e *ARGS:
	@npx tsx packages/herdr/src/cli/prepareHerdr.ts "$@"
