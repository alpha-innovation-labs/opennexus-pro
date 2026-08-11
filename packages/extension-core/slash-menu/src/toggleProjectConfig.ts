import { readProjectConfig } from "./readProjectConfig";
import { writeProjectConfig } from "./writeProjectConfig";

/**
 * Toggles one boolean project config and returns the next state.
 *
 * @param cwd Project cwd.
 * @param key Setting key.
 * @returns Next boolean value.
 */
export async function toggleProjectConfig(
	cwd: string,
	key: string,
): Promise<boolean> {
	const projectConfig = await readProjectConfig(cwd);
	const nextValue = !(projectConfig[key] === true);
	projectConfig[key] = nextValue;
	await writeProjectConfig(cwd, projectConfig);
	return nextValue;
}
