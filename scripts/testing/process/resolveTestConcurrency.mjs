/**
 * Resolves the Node test runner file concurrency for Nexus tests.
 *
 * @param {NodeJS.ProcessEnv} env Environment variables used to override the default.
 * @returns {number} Positive integer concurrency for `--test-concurrency`.
 */
export function resolveTestConcurrency(env = process.env) {
  const rawConcurrency = env.NEXUS_TEST_CONCURRENCY;

  if (rawConcurrency === undefined || rawConcurrency.trim() === "") {
    return 4;
  }

  const parsedConcurrency = Number(rawConcurrency);

  if (!Number.isInteger(parsedConcurrency) || parsedConcurrency < 1) {
    throw new Error("NEXUS_TEST_CONCURRENCY must be a positive integer.");
  }

  return parsedConcurrency;
}
