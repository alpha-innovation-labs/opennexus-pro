let promptStartedAt: number | undefined;

/**
 * Records the start time for the current foreground prompt run.
 *
 * @param startedAt Start timestamp.
 */
export function setPromptStartedAt(startedAt: number | undefined): void {
  promptStartedAt = startedAt;
}

/**
 * Reads the current foreground prompt start time.
 *
 * @returns Prompt start timestamp, if any.
 */
export function getPromptStartedAt(): number | undefined {
  return promptStartedAt;
}
