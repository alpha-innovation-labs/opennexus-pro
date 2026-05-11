import assert from "node:assert/strict";
import test from "node:test";
import { AutoUpdateModal } from "../../packages/extension-core/src/auto-update/ui/AutoUpdateModal.js";

const markerTheme = {
	fg(color: string, value: string): string {
		return `<${color}>${value}</${color}>`;
	},
};

test("auto-update footer colors y teal and n red while yes/no stay foreground", () => {
	const modal = new AutoUpdateModal({
		currentVersion: "0.2.19",
		latestVersion: "0.2.20",
		onCancel: () => {},
		onConfirm: () => {},
		packageName: "opennexus",
		theme: markerTheme,
	});

	const output = modal.render(240).join("\n");

	assert.match(output, /<syntaxType>Enter\/y<\/syntaxType>: <text>yes<\/text>/u);
	assert.match(output, /<error>Esc\/n<\/error>: <text>no<\/text>/u);
});
