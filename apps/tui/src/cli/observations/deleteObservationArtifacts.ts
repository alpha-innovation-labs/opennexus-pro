import { getObservationsDir } from "@extensions/observations";
import { deleteObservationArtifactGroup } from "./deleteObservationArtifactGroup";
import { listObservationArtifactGroups } from "./listObservationArtifactGroups";
import { selectObservationArtifactGroups } from "./selectObservationArtifactGroups";

/**
 * Deletes observation artifacts for one target.
 *
 * @param target `all`, a conversation id, or a session id.
 * @returns Number of deleted groups.
 */
export async function deleteObservationArtifacts(
	target: string,
): Promise<number> {
	const groups = await listObservationArtifactGroups(getObservationsDir());
	const selectedGroups = selectObservationArtifactGroups(groups, target);
	await Promise.all(
		selectedGroups.map((group) => deleteObservationArtifactGroup(group)),
	);
	return selectedGroups.length;
}
