const NEXUS_COMMAND_DESCRIPTIONS: Record<string, string> = {
  quit: "Quit Nexus",
};

/**
 * Normalizes built-in command descriptions for Nexus-branded UI.
 *
 * @param name Slash command name.
 * @param description Upstream command description.
 * @returns Nexus-safe command description.
 */
export function normalizeBuiltinCommandDescription(name: string, description: string | undefined): string | undefined {
  return NEXUS_COMMAND_DESCRIPTIONS[name] ?? description;
}
