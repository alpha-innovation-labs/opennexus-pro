# Run Biome lint across the entire codebase via Turbo.
# Usage: just lint [FILTER]
# Example: just lint @extensions/ai-provider

[positional-arguments]
lint *ARGS:
    @if [ $# -gt 0 ]; then npx turbo --filter="$1" lint --output-logs=errors-only "${@:2}"; else npx turbo lint --output-logs=errors-only; fi
