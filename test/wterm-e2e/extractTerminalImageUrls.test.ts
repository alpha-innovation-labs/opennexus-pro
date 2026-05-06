import assert from "node:assert/strict";
import test from "node:test";
import { extractTerminalImageUrls } from "../../apps/wterm-e2e/src/ui/extractTerminalImageUrls.js";

test("extractTerminalImageUrls finds terminal-printed image URLs", () => {
  assert.deepEqual(extractTerminalImageUrls("USDC 🖼 https://example.test/usdc.png next"), ["https://example.test/usdc.png"]);
});
