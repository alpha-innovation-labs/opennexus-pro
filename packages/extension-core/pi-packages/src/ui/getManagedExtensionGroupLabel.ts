import type { ManagedExtensionKind } from "../model/types";

/**
 * Gets the display group label for an extension source kind.
 *
 * @param kind Extension source kind.
 * @returns Human-readable group label.
 */
export function getManagedExtensionGroupLabel(
	kind: ManagedExtensionKind,
): string {
	return kind === "core" ? "Core" : "Third-party";
}
