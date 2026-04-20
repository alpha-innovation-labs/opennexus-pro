import * as fs from "node:fs";
import type { ExtensionConfig } from "../../vendor/types.js";
import { getSubagentConfigPath } from "./getSubagentConfigPath.js";

/**
 * Reads the subagents extension config file when present.
 *
 * @returns Parsed config or an empty config object.
 */
export function loadSubagentConfig(): ExtensionConfig {
	const configPath = getSubagentConfigPath();

	try {
		if (fs.existsSync(configPath)) {
			return JSON.parse(fs.readFileSync(configPath, "utf-8")) as ExtensionConfig;
		}
	} catch (error) {
		console.error(`Failed to load subagent config from '${configPath}':`, error);
	}

	return {};
}
