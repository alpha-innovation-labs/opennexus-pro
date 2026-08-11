import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Reads the vendor extension update manifest.
 *
 * @returns {Promise<Array<{ id: string, source: string, target: string }>>} Vendor entries.
 */
export async function readVendorManifest() {
	const manifestPath = resolve("scripts", "vendor", "vendorExtensions.json");
	return JSON.parse(await readFile(manifestPath, "utf8"));
}
