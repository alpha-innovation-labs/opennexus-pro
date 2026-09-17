# Upstream provenance

- Repository: https://github.com/tintinweb/pi-subagents
- Revision: `e955e29c51b7a6cce37e1108cd2d6c57a77e151c` (`master`)
- Upstream package: `@tintinweb/pi-subagents`, version `0.19.0`
- License: MIT; original notice retained in `LICENSE`.

## Import boundaries

`src/`, `docs/`, `examples/`, `README.md`, `LICENSE`, and `tsconfig.json` are copied unchanged from this revision. All 56 upstream source files are included. No upstream Git history, CI, development-agent configuration, tests, media, generated output, dependency trees, or npm lockfile are imported.

The local `package.json` uses the private workspace name `@extensions/subagent-tintin`, adds ESM/source exports and a typecheck script, and declares the Pi SDK dependencies using Nexus's existing version range. Upstream runtime dependency ranges are preserved. pnpm manages dependencies in the workspace lockfile.

The upstream README describes upstream installation and behavior, not Nexus activation. Nexus registers this package under `subagent-tintin`, enabled by default and visible in `/features`. The Herdr-backed `subagents` registration is removed; its source is retained. The copied upstream implementation remains unchanged.
