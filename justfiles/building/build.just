# Build the project using Turbo across all workspaces.
# Usage: just build
# Example: just build

build:
    @npx turbo build --output-logs=errors-only
