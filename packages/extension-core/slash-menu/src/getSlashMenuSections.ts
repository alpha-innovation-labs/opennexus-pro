import type { SlashMenuSection } from "./types";

/**
 * Returns the top-level slash menu sections.
 *
 * @returns Slash menu sections.
 */
export function getSlashMenuSections(): SlashMenuSection[] {
  return [
    {
      label: "Commands",
      description: "Run bundled slash commands.",
      value: "commands",
    },
    {
      label: "Settings",
      description: "Toggle Nexus settings and nested options.",
      value: "settings",
    },
  ];
}
