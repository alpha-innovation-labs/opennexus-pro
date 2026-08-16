/**
 * Creates a new Herdr workspace and returns its identifiers.
 * Mirrors `herdr workspace create` with optional cwd, label, env, and focus.
 *
 * @param options Optional workspace creation options.
 * @returns Object containing workspaceId and rootPaneId.
 */
interface CreateWorkspaceOptions {
    cwd?: string;
    label?: string;
    env?: Record<string, string>;
    focus?: boolean;
}
export declare function createHerdrWorkspace(options?: CreateWorkspaceOptions): {
    workspaceId: string;
    rootPaneId: string;
};
export {};
