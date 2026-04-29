/**
 * Removes the observation state extension from a file name.
 *
 * @param fileName Observation state file name.
 * @returns Conversation id encoded by the state file name.
 */
export function stripObservationStateExtension(fileName: string): string {
	return fileName.replace(/\.state\.json$/u, "");
}
