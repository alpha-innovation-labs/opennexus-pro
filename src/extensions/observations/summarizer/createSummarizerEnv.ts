const DISABLE_BUNDLED_EXTENSIONS_ENV = "NEXUS_DISABLE_BUNDLED_EXTENSIONS";

/**
 * Creates environment variables for a bundled summarizer subprocess.
 *
 * @returns Child environment with bundled extensions disabled.
 */
export function createSummarizerEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    [DISABLE_BUNDLED_EXTENSIONS_ENV]: "1",
  };
}
