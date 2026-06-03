import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";

/**
 * Builds an isolated environment for help-command e2e assertions.
 *
 * @param homeDir Temporary HOME path.
 * @returns Environment variables with deterministic CLI feature visibility.
 */
export async function createHelpCommandEnv(homeDir: string): Promise<NodeJS.ProcessEnv> {
	const configDir = join(homeDir, ".config", "nexus");
	await mkdir(configDir, { recursive: true });
	await writeFile(join(configDir, "config.json"), `${JSON.stringify({
		extensions: {
			automations: { enabled: true },
			"social-automation": { enabled: true },
			"social-chat": { enabled: false },
			annotation: { enabled: false },
		},
	})}\n`, "utf8");
	return {
		...createReleaseTestEnv(homeDir),
		NEXUS_CONFIG_DIR: configDir,
	};
}
