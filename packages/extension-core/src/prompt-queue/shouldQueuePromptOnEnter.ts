/**
 * Decides whether Enter should queue instead of send immediately.
 *
 * @param isAgentIdle Whether the assistant is currently idle.
 * @returns True when Enter should append to the prompt queue.
 */
export function shouldQueuePromptOnEnter(isAgentIdle: boolean): boolean {
  return !isAgentIdle;
}
