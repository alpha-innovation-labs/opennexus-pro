import assert from "node:assert/strict";
import test from "node:test";
import { createExtensionRuntime, loadExtensionFromFactory } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/extensions/loader.js";
import { ExtensionRunner } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/extensions/runner.js";
import { createEventBus } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/event-bus.js";
import { registerNotifyExtension } from "../../../packages/extensions/src/notify/registerNotifyExtension.js";
import { withLockedNotifyEnv } from "../../support/notify/withLockedNotifyEnv.js";

test("notify extension emits a terminal desktop notification through the Pi runner", async () => {
	await withLockedNotifyEnv(async () => {
		const previousWrite = process.stdout.write.bind(process.stdout);
		const previousTmux = process.env.TMUX;
		const previousIterm = process.env.TERM_PROGRAM;
		const previousItermSession = process.env.ITERM_SESSION_ID;
		const previousKitty = process.env.KITTY_WINDOW_ID;
		const previousWindows = process.env.WT_SESSION;
		const previousSound = process.env.NEXUS_NOTIFY_SOUND_CMD;
		const writes: string[] = [];
		const runtime = createExtensionRuntime();
		const eventBus = createEventBus();
		const extension = await loadExtensionFromFactory(registerNotifyExtension, process.cwd(), eventBus, runtime, "<notify-test>");
		const runner = new ExtensionRunner([extension], runtime, process.cwd(), {} as never, {} as never);
		delete process.env.TMUX;
		delete process.env.TERM_PROGRAM;
		delete process.env.ITERM_SESSION_ID;
		delete process.env.KITTY_WINDOW_ID;
		delete process.env.WT_SESSION;
		process.env.NEXUS_NOTIFY_SOUND_CMD = " ";
		process.stdout.write = ((chunk: string | Uint8Array) => {
			writes.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
			return true;
		}) as typeof process.stdout.write;
		try {
			runner.bindCore({
				sendMessage() {}, sendUserMessage() {}, appendEntry() {}, setSessionName() {}, getSessionName() { return "Nexus"; }, setLabel() {},
				getActiveTools() { return []; }, getAllTools() { return []; }, setActiveTools() {}, refreshTools() {}, getCommands() { return []; },
				async setModel() { return false; }, getThinkingLevel() { return "medium" as never; }, setThinkingLevel() {},
			}, {
				getModel() { return undefined; }, isIdle() { return true; }, getSignal() { return undefined; }, abort() {}, hasPendingMessages() { return false; },
				shutdown() {}, getContextUsage() { return undefined; }, compact() {}, getSystemPrompt() { return ""; },
			});
			await runner.emit({ type: "agent_end", messages: [] });
			assert.deepEqual(writes, ["\u001b]777;notify;Nexus;Ready for input\u0007"]);
		} finally {
			process.stdout.write = previousWrite as typeof process.stdout.write;
			if (previousTmux === undefined) delete process.env.TMUX; else process.env.TMUX = previousTmux;
			if (previousIterm === undefined) delete process.env.TERM_PROGRAM; else process.env.TERM_PROGRAM = previousIterm;
			if (previousItermSession === undefined) delete process.env.ITERM_SESSION_ID; else process.env.ITERM_SESSION_ID = previousItermSession;
			if (previousKitty === undefined) delete process.env.KITTY_WINDOW_ID; else process.env.KITTY_WINDOW_ID = previousKitty;
			if (previousWindows === undefined) delete process.env.WT_SESSION; else process.env.WT_SESSION = previousWindows;
			if (previousSound === undefined) delete process.env.NEXUS_NOTIFY_SOUND_CMD; else process.env.NEXUS_NOTIFY_SOUND_CMD = previousSound;
		}
	});
});
