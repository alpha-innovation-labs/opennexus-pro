import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { renderPromptlineBorder } from "../../../packages/extensions/src/neo-editor/shared/ui/renderPromptlineBorder.js";

test("neo promptline top border stays within narrow terminal width", () => {
	const terminalWidth = 24;
	const innerWidth = terminalWidth - 2;
	const theme = { fg: (_color: string, value: string) => value };
	const promptline = {
		left: "…",
		right: "  ▰▱▱▱▱ 108k/400k",
	};

	const rendered = "╭" + renderPromptlineBorder((value) => value, theme, innerWidth, promptline) + "╮";

	assert.equal(visibleWidth(rendered), terminalWidth);
});
