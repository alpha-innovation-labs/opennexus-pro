# nexus-tui-awesome

Custom Pi TUI app that bundles the local extensions from `.pi/extensions/`.

## Commands

- `just dev` — run the custom app
- `just test` — run unit tests

## Notes

This app disables automatic extension discovery and injects the local bundled extension entrypoint inline through Pi's exported `main()` API and `extensionFactories` hook.
