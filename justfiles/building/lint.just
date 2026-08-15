# Run Biome lint across the entire codebase via Turbo.
# Usage: just lint [FILTER]
# Example: just lint @extensions/ai-provider

[positional-arguments]
lint *ARGS:
    @if [ $# -gt 0 ]; then npx turbo --filter="$1" lint "${@:2}"; else npx turbo lint ; fi
