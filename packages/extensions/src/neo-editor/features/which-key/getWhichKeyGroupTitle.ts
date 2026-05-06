/**
 * Resolves the display group for one Pi keybinding id.
 *
 * @param keybinding Pi keybinding id.
 * @returns Which-key group title.
 */
export function getWhichKeyGroupTitle(keybinding: string): string {
  if (keybinding.startsWith("tui.editor.")) return "Editor";
  if (keybinding.startsWith("tui.input.")) return "Input";
  if (keybinding.startsWith("tui.select.")) return "Selection";
  if (keybinding.startsWith("app.model.") || keybinding.startsWith("app.thinking.")) return "Models & Thinking";
  if (keybinding.startsWith("app.session.")) return "Sessions";
  if (keybinding.startsWith("app.tree.")) return "Session Tree";
  if (keybinding.startsWith("app.models.")) return "Scoped Models";
  if (keybinding.startsWith("app.message.")) return "Messages";
  if (keybinding.startsWith("app.tools.")) return "Tools";
  if (keybinding.startsWith("app.clipboard.")) return "Clipboard";
  if (keybinding.startsWith("app.editor.")) return "Editor";
  return "Application";
}
