/**
 * Converts an LSP file URI to a local file path.
 *
 * @param uri File URI from a language server.
 * @returns Decoded file path.
 */
export function fromFileUri(uri: string): string {
	if (!uri.startsWith("file://")) return uri;
	return decodeURIComponent(uri.replace(/^file:\/\//, ""));
}
