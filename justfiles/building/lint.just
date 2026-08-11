# Run Biome lint across the entire codebase via Turbo.
# Usage: just lint
# Example: just lint

lint:
    @npx turbo lint --output-logs=errors-only
