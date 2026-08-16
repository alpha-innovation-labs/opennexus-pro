/**
 * Sends key presses to an agent via `herdr agent send-keys`.
 *
 * @param agentName The target agent name.
 * @param keys      Key presses (e.g. "Enter", "Esc").
 */
export declare function sendKeysToAgent(agentName: string, ...keys: string[]): void;
