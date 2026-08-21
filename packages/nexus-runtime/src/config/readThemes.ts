import { DefaultResourceLoader } from "@earendil-works/pi-coding-agent";
import { fileURLToPath } from "node:url";
import { getNexusAgentDirPath } from "./getNexusAgentDirPath";
import { resolveInstalledDependencyPath } from "../package/resolveInstalledDependencyPath";

let cachedNames: string[] | null = null;
let cacheCwd: string | null = null;
let cacheAgentDir: string | null = null;
let cachedAdditionalThemePaths: string[] | null = null;

/**
 * Resolves Pi's bundled theme directory at runtime, so we always pick up
 * whatever default themes ship with the installed Pi version (dark, light,
 * or any future additions) without hardcoding copies.
 */
function getPiBundledThemePath(): string | null {
	try {
		const piThemeDir = resolveInstalledDependencyPath(
			import.meta.url,
			"@earendil-works/pi-coding-agent/dist/modes/interactive/theme",
			"./../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/theme",
		);
		return piThemeDir;
	} catch {
		return null;
	}
}

/**
 * Reads available theme names using Pi's DefaultResourceLoader,
 * which discovers themes from bundled, agent-dir, user, and project
 * directories. Results are cached per cwd + agentDir combination
 * to avoid reloading extensions on every slash-menu keystroke.
 *
 * @param cwd Project working directory.
 * @returns Sorted list of available theme names (deduplicated across directories).
 */
export async function readThemes(cwd: string): Promise<string[]> {
	const agentDir = getNexusAgentDirPath();
	if (cachedNames !== null && cacheCwd === cwd && cacheAgentDir === agentDir) {
		return cachedNames;
	}

	// Resolve Pi's bundled theme directory (dark, light, etc.) at runtime
	// so Nexus always reflects whatever themes ship with the installed Pi.
	const piThemeDir = getPiBundledThemePath();
	const additionalThemePaths = piThemeDir
		? [piThemeDir]
		: [];

	const loader = new DefaultResourceLoader({
		cwd,
		agentDir,
		noThemes: false,
		additionalThemePaths,
	});
	await loader.reload();
	const { themes } = loader.getThemes();
	const names = themes
		.map((t) => t.name)
		.filter((n): n is string => typeof n === "string");
	cachedNames = [...new Set(names)].sort((left, right) =>
		left.localeCompare(right),
	);
	cacheCwd = cwd;
	cacheAgentDir = agentDir;
	cachedAdditionalThemePaths = additionalThemePaths;
	return cachedNames;
}
