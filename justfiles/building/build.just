# Build the project using Turbo across all workspaces.
# Usage: just build [FILTER]
# Example: just build @extensions/ai-provider

[positional-arguments]
build *ARGS:
    @if [ $# -gt 0 ]; then npx turbo --filter="$1" build --output-logs=errors-only "${@:2}"; else npx turbo build --output-logs=errors-only; fi
