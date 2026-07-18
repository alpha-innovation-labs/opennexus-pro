import type { SlashMenuState } from "../state.ts";
import type { SlashMenuLeaf, SlashMenuSection } from "../types.ts";
import { getSlashMenuItemIcon } from "../../getSlashMenuItemIcon.ts";
import { formatTopLevelMenuLabel } from "../../formatTopLevelMenuLabel.ts";
import { formatSettingsMenuLabel } from "../../formatSettingsMenuLabel.ts";
import { formatLoginProviderLabel } from "../../formatLoginProviderLabel.ts";
import { formatResourceCommandLabel } from "../../formatResourceCommandLabel.ts";

/**
 * Formats an item for display based on level. Pure function.
 */
export function formatVisibleItem(item: SlashMenuLeaf | SlashMenuSection, state: SlashMenuState): SlashMenuLeaf | SlashMenuSection {
  const icon = getSlashMenuItemIcon(item, state.level);
  const level = state.level;

  if (level === "top") return { ...item, label: formatTopLevelMenuLabel(item.label, (item as SlashMenuLeaf).description, icon), description: "", preserveLabelWhitespace: true };
  if (level === "settings") return { ...item, label: formatSettingsMenuLabel(item.label, (item as SlashMenuLeaf).currentValue, icon), description: "", preserveLabelWhitespace: true };
  if (level === "setting-choice") return { ...item, description: "" };
  if (level === "resume") return { ...item, label: `${item.label}\n${item.description}`, description: "", preserveLabelWhitespace: true, resumeRow: true, wrapPreservedLabel: true };
  if ((level === "login" || level === "login-providers") && !item.value.startsWith("import:")) return { ...item, label: formatLoginProviderLabel(item as SlashMenuLeaf, icon), description: "" };
  if (level === "model") return { ...item, label: `${icon} ${item.label}` };
  if (level === "logout" || level === "theme" || level === "scoped-models" || level === "name-input") return { ...item, label: `${icon} ${item.label}`, description: "" };
  if (level === "prompts" || level === "skills") return { ...item, label: formatResourceCommandLabel(icon, item as SlashMenuLeaf), description: "", wrapToFit: level === "skills" };
  if (level === "tools") return { ...item, label: `${icon} ${item.label}`, fixedLabelWidth: 24 };
  return { ...item, label: `${icon} ${item.label}` };
}
