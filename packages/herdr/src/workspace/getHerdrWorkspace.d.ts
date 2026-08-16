/**
 * Gets details for a single Herdr workspace.
 * Mirrors `herdr workspace get`.
 *
 * @param workspaceId The workspace ID (e.g. "w42").
 * @returns Workspace details including label, number, tabCount, and paneCount.
 */
export declare function getHerdrWorkspace(workspaceId: string): {
    workspaceId: string;
    label?: string;
    number: number;
    tabCount: number;
    paneCount: number;
};
