import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import test from "node:test";
import { formatResult } from "../../../src/extensions/annotate/format/formatResult.js";
import type { AnnotationResult } from "../../../src/extensions/annotate/types.js";

const tinyPng =
  "data:image/png;base64," +
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR4QAAAAASUVORK5CYII=";

/**
 * Builds the expected temp file path for a formatted screenshot.
 *
 * @param suffix File suffix appended after the timestamp.
 * @returns Absolute temp file path.
 */
function getTempPath(suffix: string): string {
  return path.join(os.tmpdir(), `pi-annotate-1700000000000-${suffix}.png`);
}

test("formatResult renders successful annotations and writes screenshots", async () => {
  const originalNow = Date.now;
  Date.now = () => 1700000000000;

  const createdPaths = [
    getTempPath("full"),
    getTempPath("el1"),
    getTempPath("before"),
    getTempPath("after"),
  ];

  for (const createdPath of createdPaths) {
    fs.rmSync(createdPath, { force: true });
  }

  const result: AnnotationResult = {
    success: true,
    url: "https://example.com",
    viewport: { width: 1280, height: 720 },
    prompt: "Review spacing",
    screenshot: tinyPng,
    screenshots: [{ index: 1, dataUrl: tinyPng }],
    elements: [
      {
        selector: ".hero",
        tag: "div",
        id: "hero",
        classes: ["hero", "selected"],
        text: "Welcome",
        rect: { x: 1, y: 2, width: 300, height: 120 },
        attributes: { role: "banner" },
        comment: "Tighten padding",
        keyStyles: { display: "block" },
      },
    ],
    editCapture: {
      inlineStyles: [],
      rules: [],
      dom: [],
      beforeScreenshot: tinyPng,
      afterScreenshot: tinyPng,
      duration: 2400,
      changeCount: 2,
    },
  };

  try {
    const output = await formatResult(result);

    assert.match(output, /## Page Annotation: https:\/\/example.com/);
    assert.match(output, /\*\*Viewport:\*\* 1280×720/);
    assert.match(output, /\*\*Context:\*\* Review spacing/);
    assert.match(output, /### Selected Elements \(1\)/);
    assert.match(output, /\*\*Screenshot \(full page\):\*\*/);
    assert.match(output, /### Screenshots/);
    assert.match(output, /## Edit Capture \(2 changes, 2s\)/);

    for (const createdPath of createdPaths) {
      assert.equal(fs.existsSync(createdPath), true);
    }
  } finally {
    Date.now = originalNow;
    for (const createdPath of createdPaths) {
      fs.rmSync(createdPath, { force: true });
    }
  }
});

test("formatResult renders cancelled annotations", async () => {
  const output = await formatResult({
    success: false,
    cancelled: true,
    reason: "user",
  });

  assert.equal(output, "Annotation cancelled by user.");
});
