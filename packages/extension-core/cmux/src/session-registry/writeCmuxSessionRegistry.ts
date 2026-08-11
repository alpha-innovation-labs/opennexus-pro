import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { CmuxSessionRegistry } from "./types";

/**
 * Writes the cmux session registry to disk with private permissions.
 *
 * @param registryPath Registry file path.
 * @param registry Registry contents.
 */
export async function writeCmuxSessionRegistry(
	registryPath: string,
	registry: CmuxSessionRegistry,
): Promise<void> {
	await mkdir(dirname(registryPath), { recursive: true });
	await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, {
		encoding: "utf8",
		mode: 0o600,
	});
}
