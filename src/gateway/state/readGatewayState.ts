import { readFile } from "node:fs/promises";
import { getGatewayStatePath } from "../paths/getGatewayStatePath.js";
import type { GatewayState } from "./types.js";

/**
 * Reads the persisted gateway state when it exists.
 *
 * @returns Gateway state or undefined when unavailable.
 */
export async function readGatewayState(): Promise<GatewayState | undefined> {
  try {
    return JSON.parse(await readFile(getGatewayStatePath(), "utf8")) as GatewayState;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}
