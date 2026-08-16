import type { CmuxSessionRegistry } from "./types";
/**
 * Updates the stored Nexus session title for one cmux surface registration.
 *
 * @param registry Existing registry.
 * @param workspaceId Workspace identifier to update.
 * @param surfaceId Surface identifier to update.
 * @param sessionTitle Latest Nexus session title.
 * @returns Updated registry.
 */
export declare function updateCmuxSessionRegistryEntryTitle(registry: CmuxSessionRegistry, workspaceId: string | undefined, surfaceId: string, sessionTitle: string): CmuxSessionRegistry;
