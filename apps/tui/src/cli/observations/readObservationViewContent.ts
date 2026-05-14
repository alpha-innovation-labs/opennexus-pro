import { readFile } from "node:fs/promises";
import { getObservationsDir } from "@nexus/extensions-pro/observations/shared/getObservationsDir.js";
import { listObservationArtifactGroups } from "./listObservationArtifactGroups.js";
import { selectObservationArtifactGroups } from "./selectObservationArtifactGroups.js";

/**
 * Reads rendered observation markdown for one session target.
 *
 * @param target Session id, id prefix, or conversation id.
 * @returns Markdown content or an error message.
 */
export async function readObservationViewContent(target: string): Promise<{ content: string } | { error: string }> {
  const groups = selectObservationArtifactGroups(await listObservationArtifactGroups(getObservationsDir()), target);
  if (groups.length === 0) return { error: `No observations found matching '${target}'` };
  if (groups.length > 1) return { error: `Multiple observations match '${target}'. Use a longer session id.` };
  const group = groups[0]!;
  if (!group.markdownPath) return { error: `No rendered observations found for '${target}'` };
  return { content: await readFile(group.markdownPath, "utf8") };
}
