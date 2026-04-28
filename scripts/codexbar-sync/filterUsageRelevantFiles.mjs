const usageRelevantPattern = /(^Sources\/CodexBarCore\/Providers\/|^Sources\/CodexBarCore\/OpenAIWeb\/|^Sources\/CodexBar\/UsageStore|^docs\/.*provider|^docs\/.*usage|^docs\/.*minimax|^docs\/.*codex)/i;

/**
 * Filters CodexBar changed files to likely provider-usage implementation files.
 *
 * @param {string[]} files Changed file paths.
 * @returns {string[]} Usage-relevant paths.
 */
export function filterUsageRelevantFiles(files) {
  return files.filter((file) => usageRelevantPattern.test(file));
}
