import { getFfiRsPlatformPackageName } from "./getFfiRsPlatformPackageName.mjs";

const FFI_RS_PACKAGE_PREFIX = "@yuuang/ffi-rs-";

/**
 * Resolves the ffi-rs native binding filename for one platform tuple.
 *
 * @param {{ platform?: NodeJS.Platform, arch?: string, libc?: "gnu" | "musl" }} options Platform options.
 * @returns {string} Native binding filename.
 */
export function getFfiRsNativeBindingFilename(options = {}) {
  const packageName = getFfiRsPlatformPackageName(options);
  return `ffi-rs.${packageName.slice(FFI_RS_PACKAGE_PREFIX.length)}.node`;
}
