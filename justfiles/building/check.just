# ============================================================================
# Check Command
# ============================================================================

# Run lint, build, and typecheck across the codebase via Turbo.
# Usage: just check [FILTER]
# Example: just check @extensions/ai-provider

[positional-arguments]
check *ARGS:
    @if [ $# -gt 0 ]; then npx turbo --filter="$1" check --output-logs=errors-only "${@:2}"; else npx turbo check --output-logs=errors-only; fi
