import assert from "node:assert/strict";
import test from "node:test";
import { trackMarkdownDiff } from "../../../packages/extensions/src/md-editor/diff/trackMarkdownDiff.js";
import { renderMarkdownDiffTokens } from "../../../packages/extensions/src/md-editor/diff/renderMarkdownDiffTokens.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("editor_file_reload_diff_accept", () => {
	const tokens = trackMarkdownDiff("hello old world", "hello new world");
	assert.ok(tokens.some((token) => token.kind === "added" && token.text === "new"));
	assert.ok(tokens.some((token) => token.kind === "removed" && token.text === "old"));
	const rendered = renderMarkdownDiffTokens(tokens, createTestTheme());
	assert.match(rendered, /new/);
	assert.match(rendered, /old/);
});
