/**
 * Waits for an agent to reach a specific status.
 * Mirrors `herdr agent wait <agentName> --status <status> --timeout <ms>`.
 *
 * @param agentName The agent name to wait for.
 * @param options Status to wait for and timeout in milliseconds.
 * @returns The agent state after reaching the target status.
 */
export type AgentWaitStatus = "idle" | "working" | "blocked" | "done";
export interface WaitAgentOptions {
    status: AgentWaitStatus;
    timeoutMs?: number;
}
export declare function waitAgent(agentName: string, { status, timeoutMs }: WaitAgentOptions): Record<string, unknown>;
