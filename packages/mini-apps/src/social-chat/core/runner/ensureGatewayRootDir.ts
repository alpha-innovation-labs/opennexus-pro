import { mkdir } from "node:fs/promises";
import { getGatewayRootPath } from "../paths/getGatewayRootPath.js";

/**
 * Ensures the gateway storage directory exists.
 *
 * @returns A promise that resolves after the directory exists.
 */
export async function ensureGatewayRootDir(): Promise<void> {
  await mkdir(getGatewayRootPath(), { recursive: true });
}
