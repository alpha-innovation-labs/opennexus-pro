import { resolveInstalledDependencyPath } from "@nexus/runtime/package/resolveInstalledDependencyPath";

/**
 * Resolves the FFF module entrypoint from the installed package root.
 *
 * @returns Absolute FFF module entry path.
 */
export function getFffNodeEntryPath(): string {
  return resolveInstalledDependencyPath(
    import.meta.url,
    "@ff-labs/fff-node/dist/src/index.js",
    "../../../../../node_modules/@ff-labs/fff-node/dist/src/index.js",
  );
}
