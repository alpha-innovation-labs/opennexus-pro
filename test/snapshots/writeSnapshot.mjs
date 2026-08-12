import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SNAPSHOT_DIR = join(__dirname, "snapshots");

/**
 * Writes an approved snapshot by group and test name.
 *
 * @param {string} projectRoot - Project root directory.
 * @param {string} group - Describe group name.
 * @param {string} testName - Test name.
 * @param {object} current - The current test result { output, checks }.
 */
export async function writeSnapshot(projectRoot, group, testName, current) {
	const snapshotName = `${group} > ${testName}`;
	const snapPath = join(SNAPSHOT_DIR, `${snapshotName}.json`);
	if (!existsSync(SNAPSHOT_DIR)) {
		mkdirSync(SNAPSHOT_DIR, { recursive: true });
	}
	writeFileSync(snapPath, JSON.stringify(current, null, 2), "utf-8");
}

/**
 * Compares a current result against an approved snapshot.
 * Throws on mismatch.
 *
 * @param {object} current - The current test result { output, checks }.
 * @param {object} approved - The approved snapshot { output, checks }.
 */
export function compareSnapshot(current, approved) {
	if (current.output !== approved.output) {
		const diffLines = [];
		const outA = current.output.split("\n");
		const outB = approved.output.split("\n");
		const maxLen = Math.max(outA.length, outB.length);
		for (let i = 0; i < maxLen; i++) {
			if (outA[i] !== outB[i]) {
				diffLines.push(
					`  L${i + 1}: expected "${outB[i]}" but got "${outA[i]}"`,
				);
			}
		}
		const checksA = JSON.stringify(current.checks);
		const checksB = JSON.stringify(approved.checks);
		if (checksA !== checksB) {
			diffLines.push(
				`  Checks differ: expected ${checksB}, got ${checksA}`,
			);
		}
		throw new Error(
			`Snapshot mismatch: ${current.output.substring(0, 80)}...\n${diffLines.join("\n")}`,
		);
	}
}
