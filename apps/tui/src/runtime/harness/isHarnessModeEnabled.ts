/**
 * Returns whether Nexus should boot the local Pi test-harness runner.
 *
 * @returns True when harness mode is explicitly enabled.
 */
export function isHarnessModeEnabled(): boolean {
  return process.env.NEXUS_DEV_TEST_MODE === "1";
}
