import { hasBunBinaryMarker } from "./hasBunBinaryMarker.js";

/**
 * Reports whether the current module is running from a Bun compiled binary.
 *
 * @param importMetaUrl Current module URL.
 * @returns True when Bun virtual filesystem markers are present.
 */
export function isBundledBinary(importMetaUrl: string): boolean {
  return Boolean(process.versions.bun) && hasBunBinaryMarker(importMetaUrl);
}
