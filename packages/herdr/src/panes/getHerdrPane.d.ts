/**
 * Gets details for a single Herdr pane.
 * Mirrors `herdr pane get`.
 *
 * @param paneId The pane ID (e.g. "w42:p1").
 * @returns Pane details including agent status and cwd.
 */
export declare function getHerdrPane(paneId: string): {
    paneId: string;
    agent?: string;
    status: string;
    cwd?: string;
};
