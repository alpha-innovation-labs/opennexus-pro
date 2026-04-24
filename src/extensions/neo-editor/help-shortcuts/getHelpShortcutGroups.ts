import type { HelpShortcutGroup } from "./types.js";

/**
 * Returns the keyboard shortcuts shown in Neo's inline help modal.
 *
 * @returns Shortcut groups for the help modal.
 */
export function getHelpShortcutGroups(): HelpShortcutGroup[] {
  return [
    {
      title: "Basics",
      shortcuts: [
        { label: "Send", keys: "Enter" },
        { label: "New line", keys: "\\ + Enter" },
        { label: "Paste image", keys: "Ctrl + V" },
        { label: "Clear input", keys: "Double Esc / Ctrl+C" },
        { label: "Cancel / exit Bash", keys: "Esc" },
      ],
    },
    {
      title: "Triggers",
      shortcuts: [
        { label: "Help shortcuts", keys: "?" },
        { label: "File paths", keys: "@" },
        { label: "Commands menu", keys: "/" },
        { label: "Toggle Bash mode", keys: "!" },
      ],
    },
    {
      title: "Modes",
      shortcuts: [
        { label: "Change modes", keys: "Shift + Tab" },
        { label: "Cycle reasoning level", keys: "Tab" },
        { label: "Cycle AI model", keys: "Ctrl + N" },
        { label: "Set autonomy", keys: "Ctrl + L" },
      ],
    },
    {
      title: "Navigation",
      shortcuts: [
        { label: "History or line navigation", keys: "↑/↓" },
        { label: "Jump to line start/end", keys: "Cmd + ←/→" },
        { label: "Delete word", keys: "Option + Delete" },
        { label: "Delete line", keys: "Cmd + Delete" },
      ],
    },
    {
      title: "Panels",
      shortcuts: [
        { label: "Toggle detailed view", keys: "Ctrl + O" },
        { label: "Collapse tool groups", keys: "Shift + Ctrl + C" },
        { label: "Open observations", keys: "Ctrl + /" },
        { label: "Open sessions", keys: "Ctrl + ;" },
      ],
    },
  ];
}
