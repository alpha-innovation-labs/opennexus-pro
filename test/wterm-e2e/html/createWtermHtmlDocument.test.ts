import assert from "node:assert/strict";
import test from "node:test";
import { createWtermHtmlDocument } from "../../../apps/wterm-e2e/src/html/createWtermHtmlDocument.js";

test("createWtermHtmlDocument serves the bundled assets", () => {
  const html = createWtermHtmlDocument();

  assert.match(html, /id="terminal"/);
  assert.match(html, /aria-label="Nexus terminal"/);
  assert.match(html, /href="\/client\.css"/);
  assert.match(html, /src="\/client\.js"/);
});
