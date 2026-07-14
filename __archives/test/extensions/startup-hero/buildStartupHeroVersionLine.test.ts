import assert from "node:assert/strict";
import test from "node:test";
import { buildStartupHeroVersionLine } from "../../../packages/extension-core/src/startup-hero/buildStartupHeroVersionLine.js";

test("startup hero version uses the thinking text color", () => {
	const line = buildStartupHeroVersionLine({
		fg(color: string, value: string): string {
			return `${color}:${value}`;
		},
	}, "1.2.3", 20);

	assert.equal(line, "thinkingText:v1.2.3");
});

test("startup hero version shows the startup duration badge next to the version", () => {
	const line = buildStartupHeroVersionLine({
		fg(color: string, value: string): string {
			return `${color}:${value}`;
		},
	}, "1.2.3", 30, "[⏱ 2:26]");

	assert.equal(line, "thinkingText:v1.2.3 [⏱ 2:26]");
});
