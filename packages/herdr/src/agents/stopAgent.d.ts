/**
 * Stops/kills an agent.
 * Mirrors `herdr agent stop <agentName>`.
 *
 * @param agentName The agent name to stop.
 * @returns Process exit status (0 = success).
 */
export declare function stopAgent(agentName: string): number;
