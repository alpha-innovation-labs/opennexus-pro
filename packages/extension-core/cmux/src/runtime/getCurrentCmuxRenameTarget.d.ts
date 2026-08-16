export type CmuxRenameTarget = {
    workspaceId?: string;
    surfaceId?: string;
};
/**
 * Reads the current cmux workspace and surface identifiers from the environment.
 *
 * @returns Current cmux rename target identifiers.
 */
export declare function getCurrentCmuxRenameTarget(): CmuxRenameTarget;
