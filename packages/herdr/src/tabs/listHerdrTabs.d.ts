/**
 * Lists all tabs, optionally filtered by workspace.
 * Mirrors `herdr tab list`.
 *
 * @param workspaceId Optional workspace ID to filter by.
 * @returns Array of tab summaries.
 */
export declare function listHerdrTabs(workspaceId?: string): Array<{
    tabId: string;
    label?: string;
    number: number;
}>;
