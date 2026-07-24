import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import { getResourceMenuIcon } from "./getResourceMenuIcon.js";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";

const TOP_LEVEL_ICONS: Record<string, string> = {
  agents: "◇",
  changelog: "≡",
  clone: "⧉",
  compact: "◐",
  copy: "▣",
  "dev-modal": "▤",
  export: "↧",
  features: "▦",
  fork: "⑂",
  hotkeys: "⌘",
  import: "↥",
  login: "◆",
  logout: "◇",
  model: "✦",
  prompts: getResourceMenuIcon(),
  name: "✎",
  new: "+",
  observations: "◉",
  quit: "×",
  reload: "↻",
  resume: "↩",
  "scoped-models": "◈",
  session: "ⓘ",
  settings: "⚙",
  skills: getResourceMenuIcon(),
  thinking: "◌",
  Settings: "⚙",
  share: "↗",
  toolcalls: "⚒",
  tools: "⚒",
  tree: "┬",
};

/**
 * Returns the small leading icon for one slash-menu item.
 *
 * @param item Menu item to decorate.
 * @param level Current slash-menu level.
 * @returns Single visible icon for the item.
 */
export function getSlashMenuItemIcon(item: SlashMenuLeaf | SlashMenuSection, level: SlashMenuLevel): string {
  if (level === "setting-choice") return "";
  if (level === "name-input") return "✎";
  if (level === "model" || level === "scoped-models") return "•";
  if (level === "login") return "◆";
  if (level === "login-providers") return "◆";
  if (level === "logout") return "◆";
  if (level === "theme") return "◐";
  if (level === "fork") return "⑂";
  if (level === "resume") return "↩";
  if (level === "prompts" || level === "skills") return getResourceMenuIcon();
  // Handle fused skill leaves at the top level.
  if (level === "top" && item.value.startsWith("skill:")) return getResourceMenuIcon();
  if (level === "tools") return "⚒";
  if (level === "settings") {
    if ((item as SlashMenuLeaf).kind === "theme") return "◐";
    if ((item as SlashMenuLeaf).kind === "toggle") return "◉";
    return "▸";
  }
  return TOP_LEVEL_ICONS[item.value] ?? (["Extensions", "Mini-Apps"].includes(item.groupLabel ?? "") ? "✦" : "›");
}
