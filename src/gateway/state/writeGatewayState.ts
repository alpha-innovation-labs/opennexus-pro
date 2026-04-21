import { writeFile } from "node:fs/promises";
import { getGatewayStatePath } from "../paths/getGatewayStatePath.js";
import type { GatewayState } from "./types.js";

/**
 * Persists the gateway state.
 *
 * @param state Gateway state to write.
 * @returns A promise that resolves after the state is saved.
 */
export async function writeGatewayState(state: GatewayState): Promise<void> {
  await writeFile(getGatewayStatePath(), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
