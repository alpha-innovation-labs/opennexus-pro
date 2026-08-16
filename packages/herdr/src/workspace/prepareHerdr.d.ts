/**
 * Creates a new Herdr workspace, waits 0.5s for the root pane, starts a
 * default agent with kind "mastracode", and returns workspace + pane +
 * agent identifiers. Mirrors the behavior of herdr-start-agent.sh.
 *
 * @param options Workspace label and optional max wait time.
 * @returns Handle containing workspaceId, rootPaneId, and agentName.
 */
export interface PrepareHerdrOptions {
    /** Unique label for the workspace (default: "nexus-e2e"). */
    workspaceLabel?: string;
    /** Maximum seconds to wait for the pane to become available (default 30). */
    maxWaitSeconds?: number;
    /** Agent name to use instead of generating a random one. */
    agentName?: string;
}
export interface PreparedHerdr {
    /** The workspace ID (e.g. "w42"). */
    workspaceId: string;
    /** The root pane ID (e.g. "w42:p1"). */
    rootPaneId: string;
    /** The agent name that was started (e.g. "agent-3a1f"). */
    agentName: string;
}
export declare function prepareHerdr(options?: PrepareHerdrOptions): PreparedHerdr;
