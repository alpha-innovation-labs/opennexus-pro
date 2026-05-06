import assert from "node:assert/strict";
import test from "node:test";
import { createTerminalImageStreamProcessor } from "../../apps/wterm-e2e/src/ui/createTerminalImageStreamProcessor.js";
import { extractTerminalInlineImages } from "../../apps/wterm-e2e/src/ui/extractTerminalInlineImages.js";

test("extractTerminalInlineImages removes Kitty image sequences and returns image payload", () => {
  const result = extractTerminalInlineImages("before\u001b_Ga=T,f=100,q=2,c=8,r=4;abc\u001b\\after");
  assert.equal(result.text, "beforeafter");
  assert.deepEqual(result.images, [{ mimeType: "image/png", base64Data: "abc" }]);
});

test("extractTerminalInlineImages removes iTerm image sequences and returns image payload", () => {
  const result = extractTerminalInlineImages("before\u001b]1337;File=inline=1;width=8:xyz\u0007after");
  assert.equal(result.text, "beforeafter");
  assert.deepEqual(result.images, [{ mimeType: "image/png", base64Data: "xyz" }]);
});

test("createTerminalImageStreamProcessor extracts Kitty images split across chunks", () => {
  const process = createTerminalImageStreamProcessor();
  assert.deepEqual(process("before\u001b"), { text: "before", images: [] });
  assert.deepEqual(process("_Ga=T,f=100,q=2,c=8,r=4;abc\u001b\\after"), { text: "after", images: [{ mimeType: "image/png", base64Data: "abc" }] });
});

test("createTerminalImageStreamProcessor joins Kitty multipart image chunks", () => {
  const process = createTerminalImageStreamProcessor();
  assert.deepEqual(process("before\u001b_Ga=T,f=100,q=2,m=1;abc\u001b\\middle"), { text: "beforemiddle", images: [] });
  assert.deepEqual(process("\u001b_Gm=0;def\u001b\\after"), { text: "after", images: [{ mimeType: "image/png", base64Data: "abcdef" }] });
});
