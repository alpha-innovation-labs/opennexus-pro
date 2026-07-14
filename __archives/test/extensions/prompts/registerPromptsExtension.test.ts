import assert from "node:assert/strict";
import test from "node:test";
import type { BeforeAgentStartEvent } from "@earendil-works/pi-coding-agent";
import { registerSystemPromptExtension } from "../../../packages/extension-core/src/system-prompt/registerSystemPromptExtension.js";

test("system-prompt extension registers /SystemPrompt command in Configuration", () => {
	let commandName: string | undefined;
	let menuGroup: string | undefined;

	registerSystemPromptExtension({
		on() {},
		registerCommand(name: string, definition: { menuGroup?: string }) {
			commandName = name;
			menuGroup = definition.menuGroup;
		},
	} as never);

	assert.equal(commandName, "SystemPrompt");
	assert.equal(menuGroup, "Configuration");
});

test("system-prompt extension applies edited prompt and resets to default", async () => {
	let commandHandler: ((args: string, ctx: never) => Promise<void>) | undefined;
	let beforeAgentStart:
		| (() => { systemPrompt: string } | undefined)
		| undefined;
	const actions = [
		{ type: "edit" },
		{ type: "close" },
		{ type: "reset" },
		{ type: "close" },
	];
	const notifications: string[] = [];

	registerSystemPromptExtension({
		on(
			event: string,
			handler: (
				event: BeforeAgentStartEvent,
			) => { systemPrompt: string } | undefined,
		) {
			if (event === "before_agent_start")
				beforeAgentStart = () =>
					handler({ systemPrompt: "default prompt" } as never);
		},
		registerCommand(
			_name: string,
			options: { handler: (args: string, ctx: never) => Promise<void> },
		) {
			commandHandler = options.handler;
		},
	} as never);

	assert.ok(commandHandler);
	assert.ok(beforeAgentStart);
	assert.equal(beforeAgentStart(), undefined);

	const ctx = {
		getSystemPrompt: () => "default prompt",
		hasUI: true,
		ui: {
			custom: async (_factory: unknown) => actions.shift(),
			editor: async () => "custom prompt",
			notify: (message: string) => notifications.push(message),
		},
	};

	await commandHandler("", ctx as never);
	assert.deepEqual(beforeAgentStart(), { systemPrompt: "custom prompt" });

	await commandHandler("", ctx as never);
	assert.equal(beforeAgentStart(), undefined);
	assert.deepEqual(notifications, [
		"User Prompt updated for future turns.",
		"System prompt reset to default.",
	]);
});
