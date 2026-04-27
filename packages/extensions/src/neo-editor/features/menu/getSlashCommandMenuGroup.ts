import type { RegisteredSlashCommand } from "./types.js";

const BUILTIN_MENU_GROUPS: Record<string, string> = {
  clone: "Chat",
  compact: "Chat",
  copy: "Chat",
  fork: "Chat",
  name: "Chat",
  new: "Chat",
  resume: "Chat",
  session: "Chat",
  share: "Chat",
  tree: "Chat",
  login: "Auth",
  logout: "Auth",
  model: "Auth",
  "scoped-models": "Configuration",
  hotkeys: "Configuration",
  reload: "Configuration",
  settings: "Configuration",
  changelog: "System",
  export: "Workspace",
  import: "Workspace",
  quit: "System",
};

/**
 * Resolves the top-level menu group for one slash command.
 *
 * @param command Slash command metadata.
 * @returns Visible menu group label.
 */
export function getSlashCommandMenuGroup(command: RegisteredSlashCommand): string {
  if (command.menuGroup?.trim()) return command.menuGroup.trim();
  return BUILTIN_MENU_GROUPS[command.name] ?? (command.source === "extension" ? "Extensions" : "System");
}
