import type { InstallOption } from "../types/install-option";

/**
 * Resolves the selected install option, falling back to the first configured option.
 *
 * @param options Available install command options.
 * @param activeId Selected option id.
 * @returns The selected install option when available.
 */
export function getActiveInstallOption(
	options: readonly InstallOption[],
	activeId: string,
): InstallOption | undefined {
	return options.find((option) => option.id === activeId) ?? options[0];
}
