# Module: `packages/types`

Shared TypeScript type definitions across all packages. Provides common interfaces for CLI args, extension factories, mini-app manifests, and telemetry events.

## Responsibilities

- Shared type definitions for all packages
- Common interfaces for CLI arguments, extension factories, mini-app manifests
- Type safety across the monorepo

## Key Files

- `packages/types/src/` — Shared type definitions
- `packages/types/src/cli/types.ts` — CLI argument types
- `packages/types/src/extension/types.ts` — Extension factory types
- `packages/types/src/mini-app/types.ts` — Mini-app manifest types
- `packages/types/src/telemetry/types.ts` — Telemetry event types

## Public API

### Common Interfaces
- `CliArgs` — CLI argument structure
- `ExtensionFactory` — Extension factory interface
- `MiniAppManifest` — Mini-app manifest definition
- `TelemetryEvent` — Telemetry event structure

## Internal Structure

Small type-only package. No runtime code, only TypeScript interfaces and type definitions.

## Dependencies

- **Uses:** No runtime dependencies (types only)
- **Used by:** All packages (shared type definitions)

## Notable Patterns / Gotchas

- Single source of truth for shared types
- No runtime code, only type definitions
- All packages depend on this for type consistency
