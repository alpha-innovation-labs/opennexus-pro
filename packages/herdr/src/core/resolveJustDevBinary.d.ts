/**
 * Detects the binary used by `just dev` in the current project.
 *
 * Used during workspace setup to determine which agent kind to spawn.
 */
/**
 * Resolves what `just -n dev` actually runs, extracting the binary name.
 * Handles both plain recipes and shebang-body recipes (which print the
 * full script when queried with `-n`).
 *
 * @returns The detected binary name (e.g. "tsx", "bun", "node", "python").
 */
export declare function resolveJustDevBinary(): string;
