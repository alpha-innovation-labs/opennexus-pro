/**
 * Runs a shell command in a raw terminal pane.
 * Mirrors `herdr pane run <paneId> <command>`.
 *
 * @param paneId The pane ID to run the command in.
 * @param command The shell command to execute.
 * @param options Optional timeout override.
 * @returns Object containing success, output, and optional error.
 */
export interface RunCommandInPaneResult {
    success: boolean;
    output: string;
    error?: string;
}
export declare function runCommandInPane(paneId: string, command: string, { timeoutMs }?: {
    timeoutMs?: number;
}): RunCommandInPaneResult;
