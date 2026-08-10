/**
 * Reports whether dev-only observation prompt editing should be exposed.
 *
 * @returns True for source/dev runs and false for packaged release runs.
 */
export function isObservationPromptEditingEnabled(): boolean {
	return !process.env.PI_PACKAGE_DIR;
}
