import { extractVendorPackage } from "./extractVendorPackage.mjs";
import { readVendorManifest } from "./readVendorManifest.mjs";

/**
 * Updates all mirrored vendor extension packages from npm.
 *
 * @returns {Promise<void>}
 */
export async function updateVendorExtensions() {
	const entries = await readVendorManifest();
	for (const entry of entries) {
		console.log(`Updating ${entry.id} from ${entry.source}`);
		await extractVendorPackage(entry);
	}
}

await updateVendorExtensions();
