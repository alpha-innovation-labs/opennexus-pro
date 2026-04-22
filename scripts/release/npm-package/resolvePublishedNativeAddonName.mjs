import { basename } from "node:path";

/**
 * Resolves the published native addon filename for the current release host.
 *
 * @param {string} addonPath Absolute source addon path.
 * @returns {string} Published addon filename.
 */
export function resolvePublishedNativeAddonName(addonPath) {
  if (process.platform === "darwin" && process.arch === "arm64") {
    return "ffi-rs.darwin-arm64.node";
  }

  return basename(addonPath);
}
