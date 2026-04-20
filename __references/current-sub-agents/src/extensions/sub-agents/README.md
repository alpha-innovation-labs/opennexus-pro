# sub-agents import

## Imported source

- `vendor/` contains the upstream `pi-subagents` TypeScript source copied into this repo.
- The vendored copy is kept intact as the baseline import.

## App-local wrapper

- `extension/registerSubAgentsExtension.ts` is the local registration wrapper.
- `extension/createSubAgentsExtensionFactory.ts` exposes a bundled factory helper.
- `index.ts` re-exports the app-local entrypoints.

## Next refactor pass

- Move runtime groups out of `vendor/` into module folders.
- Split large files into single-purpose units.
- Replace direct upstream imports with local module imports incrementally.
