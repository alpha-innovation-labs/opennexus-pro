import { listThemes } from "./listThemes";

/**
 * Prints available themes to stdout with a checkmark on the active one.
 * Optionally filters to a single theme by name.
 *
 * @param filter Optional theme name to show info for.
 * @returns A promise that resolves after printing finishes.
 */
export async function printThemesList(filter?: string): Promise<void> {
  const { themes, currentTheme } = await listThemes();
  if (themes.length === 0) {
    console.log("No themes found.");
    return;
  }

  if (filter) {
    const idx = themes.indexOf(filter);
    if (idx === -1) {
      console.error(`Error: unknown theme "${filter}"`);
      console.error(`Available themes: ${themes.join(", ")}`);
      return;
    }
    const mark = themes[idx] === currentTheme ? "✔" : " ";
    console.log(`  ${mark} ${themes[idx]}`);
    return;
  }

  const mark = "✔";
  const pad = "  ";
  for (const theme of themes) {
    const line = theme === currentTheme ? `${pad}${mark} ${theme}` : `${pad}  ${theme}`;
    console.log(line);
  }
}
