import assert from "node:assert/strict";
import test from "node:test";
import { handleClipboardImagePaste } from "../../../packages/extension-core/src/neo-editor/features/promptline/clipboard/handleClipboardImagePaste.js";
import type { ClipboardImage } from "../../../packages/nexus-runtime/src/clipboard-image/types.js";

/**
 * Creates a minimal clipboard image fixture for paste tests.
 *
 * @returns Clipboard image fixture.
 */
function createClipboardImage(): ClipboardImage {
  return { bytes: Buffer.from([1, 2, 3]), mimeType: "image/png" };
}

test("macOS image paste shortcut falls through when clipboard has no image", () => {
  const pasted: string[] = [];

  const handled = handleClipboardImagePaste({
    platform: "darwin",
    data: "\u0016",
    matchesPasteImage: () => true,
    readImage: () => undefined,
    writeTempFile: () => "unused.png",
    pasteToEditor: (text) => pasted.push(text),
  });

  assert.equal(handled, false);
  assert.deepEqual(pasted, []);
});

test("macOS image paste shortcut handles actual clipboard images", () => {
  const pasted: string[] = [];

  const handled = handleClipboardImagePaste({
    platform: "darwin",
    data: "\u0016",
    matchesPasteImage: () => true,
    readImage: createClipboardImage,
    writeTempFile: () => "/tmp/clipboard.png",
    pasteToEditor: (text) => pasted.push(text),
  });

  assert.equal(handled, true);
  assert.deepEqual(pasted, ["/tmp/clipboard.png"]);
});

test("image paste fallback ignores non-matching input", () => {
  const handled = handleClipboardImagePaste({
    platform: "darwin",
    data: "pasted text",
    matchesPasteImage: () => false,
    readImage: createClipboardImage,
    writeTempFile: () => "/tmp/clipboard.png",
    pasteToEditor: () => undefined,
  });

  assert.equal(handled, false);
});
