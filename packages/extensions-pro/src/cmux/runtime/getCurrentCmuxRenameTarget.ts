export type CmuxRenameTarget = {
	workspaceId?: string;
	surfaceId?: string;
};

/**
 * Reads the current cmux workspace and surface identifiers from the environment.
 *
 * @returns Current cmux rename target identifiers.
 */
export function getCurrentCmuxRenameTarget(): CmuxRenameTarget {
	const workspaceId = process.env.CMUX_WORKSPACE_ID?.trim() || undefined;
	const surfaceId = process.env.CMUX_SURFACE_ID?.trim() || undefined;
	return { workspaceId, surfaceId };
}
