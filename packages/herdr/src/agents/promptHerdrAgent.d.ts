/**
 * Prompts an agent and waits for it to settle (idle/done/blocked).
 *
 * @param agentName The agent name to prompt.
 * @param promptText The text prompt to send.
 * @param timeoutMs Maximum milliseconds to wait (default 120_000).
 * @returns The agent state after the prompt settles.
 */
export declare function promptHerdrAgent(agentName: string, promptText: string, { timeoutMs }?: {
    timeoutMs?: number;
}): Record<string, unknown>;
