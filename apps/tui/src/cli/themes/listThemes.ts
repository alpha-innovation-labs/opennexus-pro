import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { readThemes } from "@nexus/runtime/config/readThemes.js";

/**
 * Lists available themes by delegating to the shared readThemes primitive,
 * which uses Pi's DefaultResourceLoader to discover themes from bundled,
 * agent-dir, user, and project directories.
 *
 * @returns { themes, currentTheme } Sorted theme names and the active theme.
 */
export async function listThemes(): Promise<{ themes: string[]; currentTheme: string }> {
  const names = await readThemes(process.cwd());

  const settings = SettingsManager.create(process.cwd());
  const storedTheme = settings.getTheme();
  // Validate: Pi may have a stale theme name in settings.json that no longer exists.
  const currentTheme = names.includes(storedTheme || "") ? storedTheme : "nexus-black";

  return {
    themes: names,
    currentTheme,
  };
}
