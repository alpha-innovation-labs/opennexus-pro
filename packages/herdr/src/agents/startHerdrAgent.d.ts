/**
 * Starts an agent in a given pane and returns the agent name.
 * Uses kind "mastracode" directly — no PATH wrapper needed.
 *
 * @param paneId The pane ID to start the agent in.
 * @param maxWaitSeconds Maximum seconds to wait for agent readiness (default 60).
 * @returns The agent name.
 */
export declare function startHerdrAgent(paneId: string, { maxWaitSeconds }?: {
    maxWaitSeconds?: number;
}): string;
