# Build the project. When called without a filter, builds the TUI with
# tsgo (flat dist/ tree). When called with a filter, builds only that
# package (no upstream deps).
# Usage: just build [FILTER]
# Example: just build @nexus/feature-flags
#          just build (produces flat dist/ tree)


[positional-arguments]
build *ARGS:
    @if [ $# -gt 0 ]; then npx turbo --filter="$1" build "${@:2}"; else npx turbo build ; fi
