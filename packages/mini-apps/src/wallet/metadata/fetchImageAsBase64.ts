/**
 * Fetches a token image as base64 for terminal inline rendering.
 *
 * @param imageUrl Remote image URL.
 * @returns Base64 image payload and MIME type when available.
 */
export async function fetchImageAsBase64(imageUrl: string): Promise<{ imageBase64: string; imageMimeType: string } | undefined> {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) return undefined;
		const imageMimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
		if (!imageMimeType.startsWith("image/")) return undefined;
		const buffer = Buffer.from(await response.arrayBuffer());
		return { imageBase64: buffer.toString("base64"), imageMimeType };
	} catch {
		return undefined;
	}
}
