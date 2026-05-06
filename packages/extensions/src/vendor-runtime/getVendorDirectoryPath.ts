import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves one vendored package directory relative to the vendor runtime module.
 *
 * @param vendorId Directory name under packages/extensions/src/vendor.
 * @returns Absolute vendored package directory path.
 */
export function getVendorDirectoryPath(vendorId: string): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..", "vendor", vendorId);
}
