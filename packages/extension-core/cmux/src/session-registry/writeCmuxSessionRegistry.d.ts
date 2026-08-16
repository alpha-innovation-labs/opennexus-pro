import type { CmuxSessionRegistry } from "./types";
/**
 * Writes the cmux session registry to disk with private permissions.
 *
 * @param registryPath Registry file path.
 * @param registry Registry contents.
 */
export declare function writeCmuxSessionRegistry(registryPath: string, registry: CmuxSessionRegistry): Promise<void>;
