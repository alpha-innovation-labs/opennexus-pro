import { existsSync, readFileSync } from "node:fs";

/**
 * Read a local image file and encode it as a data URI (base64).
 * Determines the MIME type from the file extension.
 *
 * Supported formats: png, jpeg/jpg, webp, gif, bmp.
 * Throws for unknown extensions — no MIME type guessing.
 *
 * @param filePath - Path to a local image file (png, jpeg, webp, gif, bmp).
 * @returns A data URI string (data:image/xxx;base64,...).
 * @throws Error if the file does not exist, has an unknown extension, or cannot be read.
 */
export function encodeImageToBase64(filePath: string): string {
	if (!existsSync(filePath)) {
		throw new Error(`Image file not found: ${filePath}`);
	}
	try {
		const buffer = readFileSync(filePath);
		// Determine MIME type from extension
		const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
		let mimeType: string;
		switch (ext) {
			case "png":
				mimeType = "image/png";
				break;
			case "jpeg":
			case "jpg":
				mimeType = "image/jpeg";
				break;
			case "webp":
				mimeType = "image/webp";
				break;
			case "gif":
				mimeType = "image/gif";
				break;
			case "bmp":
				mimeType = "image/bmp";
				break;
			default:
				throw new Error(`Unsupported image extension: .${ext}`);
		}
		const base64 = buffer.toString("base64");
		return `data:${mimeType};base64,${base64}`;
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to read image file: ${message}`);
	}
}
