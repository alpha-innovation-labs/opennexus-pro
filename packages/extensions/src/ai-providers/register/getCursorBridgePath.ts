import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves the Cursor HTTP/2 bridge script path for source and release runs.
 *
 * @returns Absolute path to h2-bridge.mjs.
 */
export function getCursorBridgePath(): string {
	const releasePath = process.env.PI_PACKAGE_DIR
		? join(process.env.PI_PACKAGE_DIR, "runtime", "cursor", "h2-bridge.mjs")
		: undefined;
	if (releasePath && existsSync(releasePath)) return releasePath;

	return resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../node_modules/pi-cursor-provider/h2-bridge.mjs");
}
