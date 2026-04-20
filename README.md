# nexus-tui-awesome

Custom Pi TUI app that bundles the local extensions and uses `.nexus/` for project config.

## Commands

- `just dev` — run the custom app
- `just test` — run unit tests
- `just release` — build and install the native bundled `~/.local/bin/nexus`
- `just uninstall` — remove the installed Nexus launcher and bundle

## Notes

This app disables automatic extension discovery and injects the local bundled extension entrypoint inline through Pi's exported `main()` API and `extensionFactories` hook.

`just release` now compiles a Bun-powered native binary bundle and installs only the package assets that compiled mode still needs at runtime. Dev-only feature flags stay embedded in the binary instead of shipping as a file.
