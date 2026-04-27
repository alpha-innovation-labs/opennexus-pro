import assert from "node:assert/strict";
import test from "node:test";
import { createStartupLogoWidget } from "../../../packages/extensions/src/startup-logo/createStartupLogoWidget.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup logo widget expands vertically so the first prompt starts near screen center", () => {
	const widget = createStartupLogoWidget({ terminal: { rows: 40 } } as never, createTestTheme());
	const lines = widget.render(100);

	assert.equal(lines.length, 17);
	assert.deepEqual(lines.slice(0, 12), Array.from({ length: 12 }, () => ""));
	assert.ok(lines.some((line) => line.includes(String.raw`|\  |  _____ __  __ _   _  ____ `)));
});

test("startup logo widget keeps the top of the N aligned with the lower rows", () => {
	const widget = createStartupLogoWidget({ terminal: { rows: 40 } } as never, createTestTheme());
	const logoLines = widget.render(100).filter((line) => line.trim().length > 0);
	const topRowStart = logoLines[0]!.indexOf("|");
	const lowerRowStart = logoLines[1]!.indexOf("|");

	assert.equal(topRowStart, lowerRowStart);
});
