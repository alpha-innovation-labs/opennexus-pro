import type { MarkdownPreviewStyleToken } from "./types.js";

export const HEADING_ICONS = ["① ", "② ", "③ ", "④ ", "⑤ ", "⑥ "] as const;
export const BULLET_MARKERS = ["● ", "○ ", "◆ ", "◇ "] as const;
export const CHECKBOX_UNCHECKED = "󰄱 ";
export const CHECKBOX_CHECKED = "󰱒 ";
export const CHECKBOX_TODO = "󰥔 ";
export const BLOCKQUOTE_MARKER = "▋";
export const HORIZONTAL_RULE_CHAR = "─";
export const LINK_ICON = "󰌹 ";
export const IMAGE_ICON = "󰥶 ";
export const EMAIL_ICON = "󰀓 ";

/** Returns the semantic heading background style token for a heading level. */
export function getHeadingStyleToken(level: number): MarkdownPreviewStyleToken {
  const clampedLevel = Math.min(6, Math.max(1, Math.floor(level)));
  if (clampedLevel === 1) return "heading.h1.background";
  if (clampedLevel === 2) return "heading.h2.background";
  if (clampedLevel === 3) return "heading.h3.background";
  if (clampedLevel === 4) return "heading.h4.background";
  if (clampedLevel === 5) return "heading.h5.background";
  return "heading.h6.background";
}

/** Returns a Ratkit-inspired language icon for a fenced code block language. */
export function getLanguageIcon(language: string): string {
  const normalized = language.toLowerCase();
  if (["typescript", "ts", "mts", "cts"].includes(normalized)) return " ";
  if (["javascript", "js", "mjs", "cjs"].includes(normalized)) return " ";
  if (["rust", "rs"].includes(normalized)) return " ";
  if (["python", "py"].includes(normalized)) return "󰌠 ";
  if (["markdown", "md", "mdx"].includes(normalized)) return " ";
  if (["json", "jsonc", "json5"].includes(normalized)) return " ";
  if (["yaml", "yml"].includes(normalized)) return " ";
  if (["bash", "sh", "shell", "zsh", "fish"].includes(normalized)) return " ";
  return " ";
}

/** Returns the icon used before a rendered markdown link. */
export function getLinkIcon(url: string): string {
  const normalized = url.toLowerCase();
  if (normalized.startsWith("mailto:")) return EMAIL_ICON;
  if (/\.(png|jpe?g|gif|svg|webp)$/u.test(normalized)) return IMAGE_ICON;
  return LINK_ICON;
}
