import { initTheme } from "@mariozechner/pi-coding-agent";

/**
 * Initializes the Pi theme singleton used by extension renderers in tests.
 */
export async function initializePiThemes(): Promise<void> {
  initTheme("dark");
  try {
    const globalThemeModule = await import("/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js");
    globalThemeModule.initTheme?.("dark");
  } catch {}
}
