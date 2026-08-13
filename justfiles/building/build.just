# Build the project. When called without a filter, builds the TUI with
# tsgo (flat dist/ tree). When called with a filter, delegates to turbo
# for that specific package.
# Usage: just build [FILTER]
# Example: just build @extensions/ai-provider
#          just build (produces flat dist/ tree)

[positional-arguments]
build *ARGS:
    # If a filter is provided, delegate to turbo for that package.
    # Otherwise, build the TUI with tsgo (flat dist/ tree).
    @if [ $# -gt 0 ]; then npx turbo --filter="$1" build "${@:2}"; else npx turbo build --filter=@apps/app-tui; fi
