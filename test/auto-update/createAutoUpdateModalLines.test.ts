import assert from "node:assert/strict";
import test from "node:test";
import { createAutoUpdateModalLines } from "../../packages/extensions/src/auto-update/ui/createAutoUpdateModalLines.js";

const markerTheme = {
	fg(color: string, value: string): string {
		return `<${color}>${value}</${color}>`;
	},
};

test("auto-update body colors only version numbers", () => {
	const panes = createAutoUpdateModalLines({
		currentVersion: "0.2.19",
		latestVersion: "0.2.20",
		packageName: "opennexus",
		theme: markerTheme,
	});

	assert.deepEqual(panes[0]?.lines, [
		"Current: <error>0.2.19</error>",
		"Latest: <syntaxType>0.2.20</syntaxType>",
	]);
});
