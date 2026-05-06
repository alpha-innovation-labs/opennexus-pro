import { extractITermInlineImages } from "./extractITermInlineImages.js";
import { findTerminalImageSequenceStart } from "./findTerminalImageSequenceStart.js";
import { hasCompleteTerminalImageSequence } from "./hasCompleteTerminalImageSequence.js";
import type { TerminalInlineImage } from "./TerminalInlineImage.js";

const KITTY_CHUNK_PATTERN = /\u001b_G([^;]*);([^\u001b]*)\u001b\\/g;

/**
 * Creates a stateful extractor for terminal image sequences split across chunks.
 *
 * @returns Chunk processor that emits clean text and images.
 */
export function createTerminalImageStreamProcessor(): (data: string) => { text: string; images: TerminalInlineImage[] } {
  let pending = "";
  let kittyParts: string[] = [];
  return (data: string) => {
    const combined = pending + data;
    pending = "";
    const start = findTerminalImageSequenceStart(combined);
    const candidate = start >= 0 ? combined.slice(start) : "";
    const hasPendingSequence = start >= 0 && !hasCompleteTerminalImageSequence(candidate);
    const ready = hasPendingSequence ? combined.slice(0, start) : combined;
    pending = hasPendingSequence ? combined.slice(start) : "";

    const iTerm = extractITermInlineImages(ready);
    const images = [...iTerm.images];
    const text = iTerm.text.replace(KITTY_CHUNK_PATTERN, (_match, params: string, base64Data: string) => {
      kittyParts.push(base64Data);
      if (!params.includes("m=1")) {
        images.push({ mimeType: "image/png", base64Data: kittyParts.join("") });
        kittyParts = [];
      }
      return "";
    });
    return { text, images };
  };
}
