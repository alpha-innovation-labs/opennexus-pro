# runtime/package

- Source path: `src/runtime/package`
- Parent: [`runtime`](../runtime.md)

## What this area covers

`src/runtime/package` is the runtime `package` slice. At the root it has 7 files plus 1 nested folder.

## Key files

- `src/runtime/package/resolveBundledAssetPath.ts`
- `src/runtime/package/resolveInstalledDependencyPath.ts`
- `src/runtime/package/getBinaryPackageDir.ts`
- `src/runtime/package/getConfiguredPackageDir.ts`
- `src/runtime/package/hasBunBinaryMarker.ts`
- `src/runtime/package/isBundledBinary.ts`
- `src/runtime/package/expandHomePath.ts`

## Immediate subareas

- `src/runtime/package/embedded-assets/`

## Read this first

1. `src/runtime/package/isBundledBinary.ts`
2. `src/runtime/package/resolveBundledAssetPath.ts`
3. `src/runtime/package/embedded-assets/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
