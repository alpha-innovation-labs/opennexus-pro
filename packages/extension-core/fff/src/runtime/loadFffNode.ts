import { pathToFileURL } from "node:url";
import { getFffNodeEntryPath } from "./getFffNodeEntryPath.js";

/**
 * Loads the FFF runtime entrypoint from the available packaged module path.
 *
 * @returns The loaded FFF module.
 */
export async function loadFffNode(): Promise<typeof import("@ff-labs/fff-node")> {
  return await import(pathToFileURL(getFffNodeEntryPath()).href);
}
