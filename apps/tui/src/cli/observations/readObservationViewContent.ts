import { renderObservationsMarkdown } from "@extensions/observations/tracker/renderObservationsMarkdown";
import { readObservationState } from "@extensions/observations/tracker/readObservationState";
import { getObservationsDir } from "@extensions/observations/shared/getObservationsDir";
import { listObservationArtifactGroups } from "./listObservationArtifactGroups";
import { selectObservationArtifactGroups } from "./selectObservationArtifactGroups";

/**
 * Reads rendered observation markdown for one session target from state JSON.
 *
 * @param target Session id, id prefix, or conversation id.
 * @returns Markdown content or an error message.
 */
export async function readObservationViewContent(target: string): Promise<{ content: string } | { error: string }> {
  const groups = selectObservationArtifactGroups(await listObservationArtifactGroups(getObservationsDir()), target);
  if (groups.length === 0) return { error: `No observations found matching '${target}'` };
  if (groups.length > 1) return { error: `Multiple observations match '${target}'. Use a longer session id.` };
  const group = groups[0]!;
  const statePath = group.statePath ?? group.legacyStatePath;
  if (!statePath) return { error: `No observation state found for '${target}'` };
  const state = await readObservationState(statePath, group.conversationId, process.cwd(), null);
  return { content: `${renderObservationsMarkdown(state).trimEnd()}\n` };
}
