/**
 * Creates the observations command usage text.
 *
 * @returns Usage text for observations commands.
 */
export function createObservationsUsageText(): string {
  return [
    "Usage:",
    "  nexus observations list all|<session-id> [--json]",
    "  nexus observations delete all|<session-id>",
    "  nexus observations recreate all|<session-id>",
    "  nexus observations get-location",
  ].join("\n");
}
