import { rm } from "node:fs/promises";

/**
 * Deletes one observation artifact file when it exists.
 *
 * @param filePath Observation artifact path.
 * @returns True when a file was removed.
 */
export async function deleteObservationArtifactFileIfPresent(filePath: string): Promise<boolean> {
  try {
    await rm(filePath);
    return true;
  } catch (error) {
    if (isNodeErrorCode(error, "ENOENT")) return false;
    throw error;
  }
}

/**
 * Checks whether an unknown error has the requested Node.js error code.
 *
 * @param error Unknown caught error.
 * @param code Expected Node.js error code.
 * @returns True when the error code matches.
 */
function isNodeErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
