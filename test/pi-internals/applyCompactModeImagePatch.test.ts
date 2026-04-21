import assert from "node:assert/strict";
import test from "node:test";
import { ToolExecutionComponent } from "../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { setToolGroupCollapseEnabled } from "../../src/extensions/tron/collapse/state.js";
import { applyCompactModeImagePatch } from "../../src/pi-internals/applyCompactModeImagePatch.js";
import { initializePiThemes } from "../support/theme/initializePiThemes.js";

/**
 * Creates a minimal UI stub for tool execution tests.
 *
 * @returns UI stub.
 */
function createUiStub() {
	return {
		requestRender() {},
	};
}

test("compact mode image patch hides image placeholders from tool output", async () => {
	process.env.PI_PACKAGE_DIR = `${process.cwd()}/node_modules/@mariozechner/pi-coding-agent`;
	await initializePiThemes();
	applyCompactModeImagePatch();
	setToolGroupCollapseEnabled(true);

	const component = new ToolExecutionComponent(
		"custom-tool",
		"call-1",
		{},
		{},
		undefined,
		createUiStub() as never,
	);

	component.updateResult({
		isError: false,
		content: [
			{ type: "text", text: "done" },
			{ type: "image", mimeType: "image/png", data: "abc" },
		],
	});

	const lines = component.render(60).join("\n");

	assert.equal(lines.includes("done"), true);
	assert.equal(/image/i.test(lines), false);
	setToolGroupCollapseEnabled(false);
});
