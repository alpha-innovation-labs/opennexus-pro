# tsgo Build Migration — High-Level Overview

## Current Build (esbuild-based)

- Uses **esbuild** to bundle all TypeScript source into a **single CJS file** (`dist/index-tui.cjs`).
- Copies asset files (prompts, settings, theme JSON) into `dist/`.
- Prepends a shebang to the bundled file.
- Output: one big file.

## Target Build (tsgo-based, matching pi)

- Uses **tsgo** (`@typescript/native-preview`) to **transpile** TypeScript to JavaScript.
- Output: a flat `dist/` directory mirroring `src/` structure, with `.js` files (no bundling).
- Copies asset files (prompts, settings, theme JSON) into `dist/`.
- Prepends shebang and sets executable permissions on entry points.
- Output: a directory of files that Node resolves via `Node16` module resolution.

## Key Differences

| Aspect | Current (esbuild) | Target (tsgo) |
|---|---|---|
| Compiler | esbuild (bundler) | tsgo (transpiler) |
| Output format | Single bundled CJS file | Flat `dist/` tree of `.js` files |
| Module resolution | Bundled (all resolved at bundle time) | Node16 ESM, file-per-file at runtime |
| Syntax restrictions | None (esbuild handles everything) | Erasable TypeScript syntax only (no enums, no `declare` modules, no parameter properties) |
| Final deliverable | One file | Directory of files |

## Files to Touch

1. **`apps/tui/build.mjs`** — Replace the esbuild bundling logic with a tsgo transpile + asset copy + shebang prepend workflow.
2. **`tsconfig.tui-build.json`** — Adjust to output to `./dist` with `rootDir: ./src`, disabling declarations (since we don't need `.d.ts` for the release build).
3. **`justfile`** — Update the `build` recipe to call the new `build.mjs` directly (no turbo delegation for the TUI).
4. **`package.json`** (root) — Add `@typescript/native-preview` to `devDependencies`; optionally remove `esbuild` if unused elsewhere.

## Migration Steps

1. Install `@typescript/native-preview` (the `tsgo` binary).
2. Rewrite `apps/tui/build.mjs` to:
   a. Run `tsgo -p tsconfig.tui-build.json` to transpile TS → JS into `dist/`.
   b. Copy asset files (prompts, settings, theme) into `dist/` (same as current).
   c. Prepend `#!/usr/bin/env node` to the entry point(s) and set executable permissions.
3. Update `tsconfig.tui-build.json` to target `./dist` with `rootDir: ./src`.
4. Verify the build produces a working `dist/index.js` (or `dist/cli/runCliWithApp.js`) that runs correctly with `node dist/index.js`.

## Risks

- **Erasable syntax only**: tsgo rejects non-erasable constructs (enums, `enum`-style declarations, `namespace`/`module`, parameter properties). Any source code using these must be refactored.
- **Path aliases**: tsgo resolves `@nexus/...` path aliases from `tsconfig.json`. The `tsconfig.tui-build.json` must extend the root config so these aliases work.
- **Third-party dependencies**: Unlike esbuild which can bundle CJS/ESM interop, tsgo emits `import`/`export` statements that Node resolves at runtime. All dependencies must be valid ESM or Node-resolvable CJS.
