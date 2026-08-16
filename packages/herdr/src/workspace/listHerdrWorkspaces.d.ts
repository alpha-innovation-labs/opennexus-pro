/**
 * Lists all Herdr workspaces.
 * Mirrors `herdr workspace list`.
 *
 * @param workspaceId Optional workspace ID to filter by.
 * @returns Array of workspace summaries.
 */
export declare function listHerdrWorkspaces(workspaceId?: string): Array<{
    workspaceId: string;
    label?: string;
    number: number;
}>;
