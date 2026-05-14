import { join } from "node:path";

/**
 * Resolves the ignored release-build entrypoint wrapper path.
 *
 * @param {string} buildWorkDir Release workspace directory.
 * @returns {string} Absolute generated entrypoint path.
 */
export function getReleaseEntrypointPath(buildWorkDir) {
  return join(buildWorkDir, "index.release.generated.ts");
}
