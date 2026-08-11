const reloadCommandText = "/reload";

/**
 * Reports whether editor text should trigger promptline config reload handling.
 *
 * @param value Submitted editor text.
 * @returns True when the text is the reload command.
 */
export function isReloadCommandText(value: string): boolean {
	return value.trim() === reloadCommandText;
}
