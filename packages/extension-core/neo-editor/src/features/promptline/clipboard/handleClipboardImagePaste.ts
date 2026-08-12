import type { ClipboardImage } from "@nexus/runtime";

interface HandleClipboardImagePasteOptions {
	platform: NodeJS.Platform;
	data: string;
	matchesPasteImage(data: string): boolean;
	readImage(): ClipboardImage | undefined;
	writeTempFile(image: ClipboardImage): string;
	pasteToEditor(text: string): void;
}

/**
 * Handles the macOS image paste fallback without swallowing normal text paste.
 *
 * @param options Runtime dependencies and input data for one editor input event.
 * @returns True only when an actual clipboard image was pasted into the editor.
 */
export function handleClipboardImagePaste(
	options: HandleClipboardImagePasteOptions,
): boolean {
	if (options.platform !== "darwin") return false;
	if (!options.matchesPasteImage(options.data)) return false;
	const image = options.readImage();
	if (!image) return false;
	options.pasteToEditor(options.writeTempFile(image));
	return true;
}
