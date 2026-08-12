# How pi Builds and Releases — Reference

## Repository Structure

pi is a monorepo with workspace packages:

```
packages/
  agent/          → pi-agent-core
  ai/             → pi-ai
  client/         → pi-client
  coding-agent/   → pi-coding-agent  (the CLI package)
  evals/          → @earendil-works/pi-evals
  protocol/       → pi-protocol
  server/         → pi-server
  session-backends/sqlite-node/ → pi-session-backend-sqlite-node
  telemetry/      → pi-telemetry
  tui/            → pi-tui
```

All public packages share one version (lockstep versioning).

## Build Process (Local)

### 1. Transpile with tsgo

`packages/coding-agent/package.json` defines:

```
"build": "tsgo -p tsconfig.build.json && shx chmod +x dist/cli.js dist/rpc-entry.js && npm run copy-assets"
```

- `tsgo` (from `@typescript/native-preview`) compiles TypeScript to JavaScript.
- `tsconfig.build.json` extends the monorepo `tsconfig.base.json` which sets:
  - `"module": "Node16"` — Node ESM module resolution
  - `"erasableSyntaxOnly": true` — only erasable TS syntax
  - `"rewriteRelativeImportExtensions": true` — rewrites `.ts` → `.js`
  - `"declaration": true` + `"declarationMap": true` — emits `.d.ts` files
- Output: a `dist/` directory mirroring `src/` structure with `.js` files (no bundling).

### 2. Copy Assets

A `copy-assets` script copies theme JSON, assets, docs, examples, and WASM files into `dist/`.

### 3. (Optional) Compile to Native Binary

For standalone binaries, pi uses bun's `--compile`:

```
bun build --compile --no-compile-autoload-bunfig \
  ./dist/bun/cli.js ./src/utils/image-resize-worker.ts \
  --outfile dist/pi
```

This takes the tsgo-emitted JS tree and compiles it into a single native executable.

## Release Process (Local)

### `npm run release:<patch|minor|major>`

Runs `scripts/release.mjs` which:

1. Checks for uncommitted changes (must be clean).
2. Verifies all public packages are registered on npm.
3. Bumps version across all packages (lockstep) via `npm version` + `sync-versions.js`.
4. Updates `CHANGELOG.md` files: `[Unreleased]` → `[vX.Y.Z] - date`.
5. Regenerates artifacts: model data, coding-agent shrinkwrap, install lock.
6. Runs `npm run check` (lint + typecheck), `npm run build:offline`, and `./test.sh`.
7. Commits `Release vX.Y.Z` and tags `vX.Y.Z`.
8. Adds fresh `## [Unreleased]` sections to all changelogs.
9. Commits changelog updates.
10. Pushes `main` and the tag to GitHub.

### `npm run release:local`

Builds an unpublished release into an isolated directory outside the repo for smoke testing:

1. Generates model data.
2. Runs checks (optional skip).
3. Builds each package (AI uses `build:offline` for bundled model data).
4. Runs tests (optional skip).
5. Packs all public packages into npm tarballs.
6. Builds a Bun binary release (cross-platform clipboard native bindings).
7. Creates isolated Node and Bun installs from the tarballs.
8. Prepares the output for smoke testing (both Node CLI and Bun binary).

### `npm run publish` / `npm run publish:dry`

Runs `scripts/publish.mjs`:

1. Validates all packages are lockstep versioned.
2. Checks each package has a `dist/` directory.
3. Validates pack contents (`npm pack --dry-run --json`).
4. Skips packages already published (idempotent).
5. Publishes remaining packages with `--access public --provenance --ignore-scripts`.

## CI Release Pipeline (`.github/workflows/build-binaries.yml`)

Triggered by pushing a `v*` tag. Five jobs run in sequence:

### Job 1: `build`

1. Checks out the tag.
2. Sets up Bun and Node.js.
3. Hydrates release model data.
4. Creates a deterministic source archive (`create-source-archive.sh`).
5. Builds binaries for all platforms (darwin-arm64/x64, linux-x64/arm64, windows-x64/arm64) from the source archive.
6. Stages all release assets (binaries + source archive + install lock files + SHA256SUMS + release notes).
7. Uploads as GitHub Actions artifact.

### Job 2: `stage-github-release`

1. Downloads the release artifact.
2. Validates all expected assets exist and checksums match.
3. Creates a **draft** GitHub Release with all assets.
4. Refuses to mutate an already-published release.

### Job 3: `publish-npm`

1. Checks out the tag, installs deps, builds, runs checks and tests.
2. Upgrades npm to v11 for trusted publishing.
3. Runs `publish.mjs` — publishes all packages with OIDC-based trusted publishing (no OTP, no `npm whoami`).

### Job 4: `announce-pi-dev-release`

1. Checks out the tag.
2. Verifies all published packages are available on npm (with retry/backoff).
3. Uploads a release manifest to R2 (Cloudflare) at `pi-artifacts/releases/v1/releases/vX.Y.Z.json`.
4. Advances the `latest.json` pointer on R2 to the new version (using ETag-based conditional writes, max 5 retries).

### Job 5: `publish-github-release`

1. Un-drafts the staged GitHub Release (only after all prior jobs succeed).

### Failure Cleanup: `cleanup-draft-github-release`

If any prior job fails, deletes the draft GitHub Release.

## Supporting Scripts

| Script | Purpose |
|---|---|
| `scripts/release.mjs` | Local release: bump version, update changelogs, build, test, commit, tag, push |
| `scripts/publish.mjs` | Publish packages to npm (idempotent, with provenance) |
| `scripts/local-release.mjs` | Build unpublished release for smoke testing (Node + Bun) |
| `scripts/release-notes.mjs` | Extract release notes from changelog; fix GitHub release links |
| `scripts/build-binaries.sh` | Build native binaries for all platforms |
| `scripts/create-source-archive.sh` | Create deterministic source archive for CI |
| `scripts/publish-release-announcement.mjs` | Announce verified release to R2 |
| `scripts/sync-versions.js` | Synchronize lockstep versions across all package.json files |
| `scripts/release-packages.mjs` | List public (non-private) workspace packages |
| `scripts/package-workspaces.mjs` | Recursive finder of package directories |

## Key Design Decisions

- **Lockstep versioning**: All packages share one version. Every release updates all together.
- **Transpile-first, bundle-later**: tsgo emits a flat `dist/` tree. Only the binary build (bun `--compile`) produces a single file.
- **Trusted publishing**: CI uses npm OIDC with GitHub Actions — no local `npm publish`, no OTP, no WebAuthn.
- **Idempotent publish**: `publish.mjs` skips already-published packages.
- **R2 release marker**: `pi.dev/api/latest-version` reads from R2, not npm directly. CI must succeed before npm announces a release.
- **No major releases**: `patch` = fixes + additions, `minor` = breaking changes.
