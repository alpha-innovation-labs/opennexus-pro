import assert from "node:assert/strict";
import test from "node:test";
import { createStartupLogoWidget } from "../../../src/extensions/startup-logo/createStartupLogoWidget.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup logo widget expands vertically so the first prompt starts near screen center", () => {
	const widget = createStartupLogoWidget({ terminal: { rows: 40 } } as never, createTestTheme());
	const lines = widget.render(100);

	assert.equal(lines.length, 17);
	assert.deepEqual(lines.slice(0, 12), Array.from({ length: 12 }, () => ""));
	assert.ok(lines.some((line) => line.includes(String.raw` _   _  _____ __  __ _   _  ____ `)));
});
