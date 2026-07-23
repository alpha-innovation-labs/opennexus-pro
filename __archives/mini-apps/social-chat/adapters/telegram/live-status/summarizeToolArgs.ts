/**
 * Creates a short single-line preview for tool arguments.
 *
 * @param args Tool arguments payload.
 * @returns Compact argument summary.
 */
export function summarizeToolArgs(args: unknown): string {
  if (!args || typeof args !== "object") {
    return "";
  }

  const record = args as Record<string, unknown>;
  for (const key of ["path", "pattern", "command", "description", "url"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return ` ${value.trim().replace(/\s+/g, " ").slice(0, 60)}`;
    }
  }

  return "";
}
