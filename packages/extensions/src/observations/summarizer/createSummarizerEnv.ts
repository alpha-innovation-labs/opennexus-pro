/**
 * Creates environment variables for a bundled summarizer subprocess.
 *
 * @returns Child environment inherited from the current process.
 */
export function createSummarizerEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
  };
}
