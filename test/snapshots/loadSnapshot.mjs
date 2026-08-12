import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SNAPSHOT_DIR = join(__dirname, "snapshots");

/**
 * Loads an approved snapshot by group and test name.
 *
 * @param {string} projectRoot - Project root directory.
 * @param {string} group - Describe group name.
 * @param {string} testName - Test name.
 * @returns {object|null} The snapshot object, or null if not found.
 */
export function loadSnapshot(projectRoot, group, testName) {
	const snapshotName = `${group} > ${testName}`;
	const snapPath = join(SNAPSHOT_DIR, `${snapshotName}.json`);
	try {
		return JSON.parse(readFileSync(snapPath, "utf-8"));
	} catch {
		return null;
	}
}
