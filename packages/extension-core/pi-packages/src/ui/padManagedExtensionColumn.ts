import { visibleWidth } from "@earendil-works/pi-tui";

/**
 * Pads an extension id so row status columns align.
 *
 * @param extensionId Extension id to render.
 * @param width Target visible column width.
 * @returns Padded extension id.
 */
export function padManagedExtensionColumn(extensionId: string, width: number): string {
	return `${extensionId}${" ".repeat(Math.max(0, width - visibleWidth(extensionId)))}`;
}
