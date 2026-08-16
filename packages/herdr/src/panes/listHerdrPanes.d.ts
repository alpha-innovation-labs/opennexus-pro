/**
 * Lists all panes, optionally filtered by workspace.
 * Mirrors `herdr pane list`.
 *
 * @param workspaceId Optional workspace ID to filter by.
 * @returns Array of pane summaries.
 */
export declare function listHerdrPanes(workspaceId?: string): Array<{
    paneId: string;
    agent?: string;
    status: string;
}>;
