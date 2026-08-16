import type { CmuxSessionRegistry } from "./types";
/**
 * Reads the cmux session registry from disk.
 *
 * @param registryPath Registry file path.
 * @returns Parsed registry or an empty registry when missing/invalid.
 */
export declare function readCmuxSessionRegistry(registryPath: string): Promise<CmuxSessionRegistry>;
