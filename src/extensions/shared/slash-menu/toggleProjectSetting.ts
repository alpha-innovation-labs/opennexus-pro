import { readProjectSettings } from "./readProjectSettings.js";
import { writeProjectSettings } from "./writeProjectSettings.js";

/**
 * Toggles one boolean project setting and returns the next state.
 *
 * @param cwd Project cwd.
 * @param key Setting key.
 * @returns Next boolean value.
 */
export async function toggleProjectSetting(cwd: string, key: string): Promise<boolean> {
  const settings = await readProjectSettings(cwd);
  const nextValue = !(settings[key] === true);
  settings[key] = nextValue;
  await writeProjectSettings(cwd, settings);
  return nextValue;
}
