/**
 * Reads terminal output from a raw pane.
 * Mirrors `herdr pane read <paneId>`.
 *
 * @param paneId The pane ID to read output from.
 * @param options Optional lines and source parameters.
 * @returns Object containing the raw output text.
 */
export interface ReadPaneOutputResult {
    _raw: string;
}
export declare function readPaneOutput(paneId: string, { lines, source }?: {
    lines?: number;
    source?: "recent" | "visible" | "recent-unwrapped";
}): ReadPaneOutputResult;
