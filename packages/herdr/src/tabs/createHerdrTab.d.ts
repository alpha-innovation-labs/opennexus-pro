/**
 * Creates a new Herdr tab and returns its identifier.
 * Mirrors `herdr tab create` with optional workspace, cwd, label, env, and focus.
 *
 * @param options Optional tab creation options.
 * @returns Object containing tabId.
 */
interface CreateTabOptions {
    label?: string;
    workspaceId?: string;
    cwd?: string;
    env?: Record<string, string>;
    focus?: boolean;
}
export declare function createHerdrTab(options?: CreateTabOptions): {
    tabId: string;
};
export {};
