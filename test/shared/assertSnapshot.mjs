import { loadSnapshot } from "../../scripts/testing/snapshots/loadSnapshot.mjs";
import { writeSnapshot, compareSnapshot } from "../../scripts/testing/snapshots/writeSnapshot.mjs";

/**
 * Runs a snapshot-asserted test: compares the current result against
 * an approved snapshot, or writes a new snapshot in approve mode.
 *
 * Usage inside a test():
 *   await assertSnapshot({
 *     projectRoot: process.cwd(),
 *     group: "login-rework",
 *     testName: "two-pane modal opens on /login",
 *     output: readOutput(agentName, 100),
 *     checks: [
 *       { name: "Left pane title is 'Providers'", pass: output.includes("Providers") },
 *     ],
 *   });
 *
 * @param {object} options
 * @param {string} options.projectRoot - Project root directory.
 * @param {string} options.group - Describe group name.
 * @param {string} options.testName - Test name (e.g. "two-pane modal opens on /login").
 * @param {string} options.output - Raw output from `agent-e2e read`.
 * @param {Array<{name: string, pass: boolean}>} options.checks - Assertion checks.
 * @param {boolean} [options.approve=false] - If true, write a new snapshot instead of comparing.
 */
export async function assertSnapshot({ projectRoot, group, testName, output, checks, approve = false }) {
  const snapshotName = `${group} > ${testName}`;
  const current = { output, checks };

  if (approve) {
    await writeSnapshot(projectRoot, group, testName, current);
    console.log(`  → Snapshot written: ${snapshotName}`);
    return;
  }

  const approved = await loadSnapshot(projectRoot, group, testName);

  if (!approved) {
    // No approved snapshot exists — write one and report.
    await writeSnapshot(projectRoot, group, testName, current);
    console.log(`  → No approved snapshot found. Written new snapshot: ${snapshotName}`);
    console.log(`  → Re-run without --approve to validate against it.`);
    return;
  }

  compareSnapshot(current, approved);
  console.log(`  ✓ Snapshot matches approved: ${snapshotName}`);
}
