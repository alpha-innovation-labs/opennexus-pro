# Run the Cursor SDK playground harness
[group('development')]
playground *ARGS:
    npm run playground --workspace @nexus/playground -- {{ARGS}}
