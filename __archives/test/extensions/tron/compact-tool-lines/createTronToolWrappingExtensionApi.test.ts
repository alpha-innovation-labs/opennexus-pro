import assert from "node:assert/strict";
import test from "node:test";
import { Type } from "@sinclair/typebox";
import { Container } from "@earendil-works/pi-tui";
import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import { createTronToolWrappingExtensionApi } from "../../../../packages/extension-core/src/tron/compact-tool-lines/createTronToolWrappingExtensionApi.js";
import { markCompactWrappedToolDefinition } from "../../../../packages/extension-core/src/tron/compact-tool-lines/markCompactWrappedToolDefinition.js";

/**
 * Creates a minimal extension API that records registered tool definitions.
 *
 * @returns Recorded tool definitions and proxied API.
 */
function createHarness(): { tools: ToolDefinition<any, any, any>[]; pi: ReturnType<typeof createTronToolWrappingExtensionApi> } {
	const tools: ToolDefinition<any, any, any>[] = [];
	const pi = createTronToolWrappingExtensionApi({
		registerTool(definition: ToolDefinition<any, any, any>) {
			tools.push(definition);
		},
	} as never);
	return { tools, pi };
}

/**
 * Creates one custom tool definition without Tron renderers.
 *
 * @returns Custom tool definition.
 */
function createCustomTool(): ToolDefinition<any, any, any> {
	return {
		name: "memory_fetch_tweet",
		label: "Fetch Tweet",
		description: "Fetch a tweet.",
		parameters: Type.Object({ tweetUrl: Type.String() }),
		async execute() {
			return { content: [{ type: "text", text: "ok" }] };
		},
	};
}

test("Tron tool wrapper adds compact rendering to custom tools", () => {
	const { tools, pi } = createHarness();

	pi.registerTool(createCustomTool());

	assert.equal(tools.length, 1);
	assert.equal(tools[0].renderShell, "self");
	assert.equal(typeof tools[0].renderCall, "function");
	assert.equal(typeof tools[0].renderResult, "function");
});

test("Tron tool wrapper does not double-wrap compact tools", () => {
	const { tools, pi } = createHarness();
	const tool = markCompactWrappedToolDefinition({
		...createCustomTool(),
		renderShell: "self" as const,
		renderCall() {
			return new Container();
		},
	});

	pi.registerTool(tool);

	assert.equal(tools[0], tool);
});
