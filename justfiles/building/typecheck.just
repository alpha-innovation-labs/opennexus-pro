# Run TypeScript typecheck across the entire codebase via Turbo.
# Usage: just typecheck [FILTER]
# Example: just typecheck @extensions/ai-provider

[positional-arguments]
typecheck *ARGS:
    @if [ $# -gt 0 ]; then npx turbo --filter="$1" typecheck "${@:2}"; else npx turbo typecheck ; fi
