/**
 * Sends text to an agent via `herdr agent send-text`, then sends Enter
 * to submit it.
 *
 * @param agentName The target agent name (e.g. "agent-abc1").
 * @param text      The text to send.
 */
export declare function sendTextToAgent(agentName: string, text: string): void;
