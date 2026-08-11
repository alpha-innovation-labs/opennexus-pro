import { spawnSync } from "node:child_process";
import type { ClipboardImage } from "./types";

const MAC_OS_CLIPBOARD_IMAGE_JXA = [
	"ObjC.import('AppKit');",
	"ObjC.import('Foundation');",
	"function getPngData() {",
	"  const pasteboard = $.NSPasteboard.generalPasteboard;",
	"  const pngData = pasteboard.dataForType($.NSPasteboardTypePNG);",
	"  if (pngData) return pngData;",
	"  const tiffData = pasteboard.dataForType($.NSPasteboardTypeTIFF);",
	"  if (!tiffData) return null;",
	"  const imageRep = $.NSBitmapImageRep.imageRepWithData(tiffData);",
	"  if (!imageRep) return null;",
	"  return imageRep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $({}));",
	"}",
	"const pngData = getPngData();",
	"if (!pngData) {",
	"  console.log('null');",
	"} else {",
	"  console.log(JSON.stringify({ mimeType: 'image/png', base64: ObjC.unwrap(pngData.base64EncodedStringWithOptions(0)) }));",
	"}",
].join("\n");

/**
 * Reads the current macOS clipboard image through JXA and returns PNG bytes.
 *
 * @returns Clipboard image bytes when the clipboard contains an image.
 */
export function readClipboardImageViaMacOsJxa(): ClipboardImage | undefined {
	if (process.platform !== "darwin") return undefined;

	try {
		const result = spawnSync("osascript", ["-l", "JavaScript"], {
			input: MAC_OS_CLIPBOARD_IMAGE_JXA,
			encoding: "utf8",
			maxBuffer: 20 * 1024 * 1024,
			stdio: ["pipe", "pipe", "pipe"],
		});
		const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();

		if (result.error || result.status !== 0 || !output || output === "null")
			return undefined;
		const parsed = JSON.parse(output) as { base64: string; mimeType: string };
		return {
			bytes: Buffer.from(parsed.base64, "base64"),
			mimeType: parsed.mimeType,
		};
	} catch {
		return undefined;
	}
}
