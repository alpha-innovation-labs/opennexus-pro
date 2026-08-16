/**
 * Reads text output from an agent pane.
 * Mirrors `herdr agent read <agentName>`.
 *
 * @param agentName The agent name to read output from.
 * @param options Optional lines and source parameters.
 * @returns Object containing the raw output text.
 */
export interface ReadAgentOutputResult {
    _raw: string;
}
export declare function readAgentOutput(agentName: string, { lines, source }?: {
    lines?: number;
    source?: "recent" | "visible" | "recent-unwrapped";
}): ReadAgentOutputResult;
