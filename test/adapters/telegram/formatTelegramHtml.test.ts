import assert from "node:assert/strict";
import test from "node:test";
import { formatTelegramHtml } from "../../../packages/social-adapters/src/telegram/format/formatTelegramHtml.js";

test("formatTelegramHtml renders bold and inline code", () => {
  assert.equal(formatTelegramHtml("**Hello** `world`") , "<b>Hello</b> <code>world</code>");
});

test("formatTelegramHtml renders fenced code blocks", () => {
  assert.equal(
    formatTelegramHtml("```ts\nconst x = 1;\n```"),
    "<pre><code class=\"language-ts\">const x = 1;\n</code></pre>",
  );
});

test("formatTelegramHtml escapes plain html characters", () => {
  assert.equal(formatTelegramHtml("1 < 2 and 3 > 2"), "1 &lt; 2 and 3 &gt; 2");
});
