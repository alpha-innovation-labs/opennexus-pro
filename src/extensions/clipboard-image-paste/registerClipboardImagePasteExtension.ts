import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readClipboardImageViaMacOsJxa } from "../../runtime/clipboard-image/readClipboardImageViaMacOsJxa.js";
import { writeClipboardImageTempFile } from "../../runtime/clipboard-image/writeClipboardImageTempFile.js";

/**
 * Registers a macOS clipboard image paste fallback for Ctrl+V in Nexus.
 *
 * @param pi Pi extension API.
 */
export function registerClipboardImagePasteExtension(pi: ExtensionAPI): void {
  if (process.platform !== "darwin") return;

  pi.registerShortcut("ctrl+v", {
    description: "Paste image from clipboard",
    async handler(ctx) {
      if (!ctx.hasUI) return;
      const image = readClipboardImageViaMacOsJxa();
      if (!image) return;
      ctx.ui.pasteToEditor(writeClipboardImageTempFile(image));
    },
  });
}
