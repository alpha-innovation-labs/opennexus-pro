import type { FileFinder, InitOptions, Result } from "@ff-labs/fff-node";
import { shouldRetryWithoutDatabases } from "./shouldRetryWithoutDatabases";

/**
 * Creates an FFF file finder and falls back to in-memory mode when LMDB readers are exhausted.
 *
 * @param FileFinderCtor Native FFF file finder constructor namespace.
 * @param options Primary initialization options.
 * @returns FFF creation result.
 */
export function createFinder(
  FileFinderCtor: { create: (options: InitOptions) => Result<FileFinder> },
  options: InitOptions,
): Result<FileFinder> {
  const created = FileFinderCtor.create(options);
  if (!shouldRetryWithoutDatabases(created)) {
    return created;
  }

  return FileFinderCtor.create({
    basePath: options.basePath,
    aiMode: options.aiMode,
    disableWatch: options.disableWatch,
    disableMmapCache: options.disableMmapCache,
    disableContentIndexing: options.disableContentIndexing,
    useUnsafeNoLock: options.useUnsafeNoLock,
  });
}
