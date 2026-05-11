import * as path from "node:path";
import type { LanguageServerConfig } from "../types.js";
import { languageServerConfigs } from "./languageServerConfigs.js";

/**
 * Finds the first configured language server for a file path.
 *
 * @param filePath File path to inspect.
 * @returns Matching language server config, or undefined.
 */
export function findServerConfig(filePath: string): LanguageServerConfig | undefined {
	const basename = path.basename(filePath);
	const extension = path.extname(filePath);
	return languageServerConfigs().find((config) => config.extensions.includes(extension) || config.extensions.includes(basename));
}
