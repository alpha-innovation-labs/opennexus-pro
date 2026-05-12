import { deleteSessionFile } from "./deleteSessionFile.js";
import { formatAmbiguousDeleteSessionMessage } from "./formatAmbiguousDeleteSessionMessage.js";
import { readDeleteSessionArg } from "./readDeleteSessionArg.js";
import { resolveDeleteSessionTarget } from "./resolveDeleteSessionTarget.js";

/**
 * Runs the Nexus session deletion CLI command.
 *
 * @param argv Raw CLI arguments.
 * @param cwd Current working directory for local session lookup.
 * @param sessionDir Optional custom session directory.
 * @returns Process exit code for the command.
 */
export async function runDeleteSessionCommand(argv: readonly string[], cwd: string, sessionDir?: string): Promise<number> {
  const sessionReference = readDeleteSessionArg(argv);
  if (!sessionReference) {
    console.error("Usage: nexus --delete-session <session-id>");
    return 1;
  }

  const result = await resolveDeleteSessionTarget(sessionReference, cwd, sessionDir);
  if (result.type === "not_found") {
    console.error(`No session found matching '${result.sessionReference}'`);
    return 1;
  }
  if (result.type === "ambiguous") {
    console.error(formatAmbiguousDeleteSessionMessage(result.sessionReference, result.matches));
    return 1;
  }

  await deleteSessionFile(result.session.path);
  console.log(`Deleted session ${result.session.id}`);
  return 0;
}
