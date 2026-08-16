/**
 * Starts an agent in a pane with inherited stdio (foreground blocking).
 * Use this when the caller should wait for the agent to finish,
 * e.g. when the CLI or extension tool is the terminal itself.
 *
 * @param agentName The agent name.
 * @param paneId    The pane to start in.
 * @param options   Optional skills to preload.
 * @returns The process exit status.
 */
export declare function startForegroundAgent(agentName: string, paneId: string, options?: {
    skills?: string[];
    stdio?: "inherit" | "pipe";
    blocking?: boolean;
}): number;
