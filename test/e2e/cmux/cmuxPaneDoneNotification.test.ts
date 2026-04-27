import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createExtensionRuntime, loadExtensionFromFactory } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/extensions/loader.js";
import { ExtensionRunner } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/extensions/runner.js";
import { createEventBus } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/event-bus.js";
import { registerCmuxExtension } from "../../../packages/extensions/src/cmux/registerCmuxExtension.js";
import { createFakeCmuxExecutable } from "../../support/cmux/createFakeCmuxExecutable.js";
import { removeFakeCmuxExecutable } from "../../support/cmux/removeFakeCmuxExecutable.js";
import { withLockedCmuxEnv } from "../../support/cmux/withLockedCmuxEnv.js";
import { VirtualTerminal } from "../../support/terminal/VirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("cmux notifies the active tab when the pane is done", async () => {
	await withLockedCmuxEnv(async () => {
		const fakeCmux = await createFakeCmuxExecutable();
		const previousCmuxBin = process.env.NEXUS_CMUX_BIN;
		const previousCmuxLog = process.env.CMUX_TEST_LOG;
		const previousWorkspaceId = process.env.CMUX_WORKSPACE_ID;
		const previousSurfaceId = process.env.CMUX_SURFACE_ID;
		const runtime = createExtensionRuntime();
		const eventBus = createEventBus();
		const extension = await loadExtensionFromFactory(registerCmuxExtension, process.cwd(), eventBus, runtime, "<cmux-test>");
		const runner = new ExtensionRunner([extension], runtime, process.cwd(), {} as never, {} as never);
		const terminal = new VirtualTerminal(100, 20);

		process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
		process.env.CMUX_TEST_LOG = fakeCmux.logPath;
		process.env.CMUX_WORKSPACE_ID = "workspace-test";
		process.env.CMUX_SURFACE_ID = "surface-test";

		try {
			runner.bindCore(
				{
					sendMessage() {},
					sendUserMessage() {},
					appendEntry() {},
					setSessionName() {},
					getSessionName() {
						return "Observed topic title";
					},
					setLabel() {},
					getActiveTools() {
						return [];
					},
					getAllTools() {
						return [];
					},
					setActiveTools() {},
					refreshTools() {},
					getCommands() {
						return [];
					},
					async setModel() {
						return false;
					},
					getThinkingLevel() {
						return "medium" as never;
					},
					setThinkingLevel() {},
				},
				{
					getModel() {
						return undefined;
					},
					isIdle() {
						return true;
					},
					getSignal() {
						return undefined;
					},
					abort() {},
					hasPendingMessages() {
						return false;
					},
					shutdown() {},
					getContextUsage() {
						return undefined;
					},
					compact() {},
					getSystemPrompt() {
						return "";
					},
				},
			);
			terminal.start(() => undefined, () => undefined);
			runner.setUIContext({
				select: async () => undefined,
				confirm: async () => false,
				input: async () => undefined,
				notify: () => undefined,
				onTerminalInput: () => () => undefined,
				setStatus: () => undefined,
				setWorkingMessage: () => undefined,
				setHiddenThinkingLabel: () => undefined,
				setWidget: () => undefined,
				setFooter: () => undefined,
				setHeader: () => undefined,
				setTitle: (title: string) => terminal.setTitle(title),
				custom: async () => undefined as never,
				pasteToEditor: () => undefined,
				setEditorText: () => undefined,
				getEditorText: () => "",
				editor: async () => undefined,
				setEditorComponent: () => undefined,
				get theme() {
					return createTestTheme() as never;
				},
				getAllThemes: () => [],
				getTheme: () => undefined,
				setTheme: () => ({ success: false, error: "unsupported in test" }),
				getToolsExpanded: () => false,
				setToolsExpanded: () => undefined,
			} as never);

			await runner.emit({
				type: "agent_end",
				messages: [],
			});

			const cmuxOutput = await readFile(fakeCmux.logPath, "utf8");
			assert.match(cmuxOutput, /^notify\n/);
			assert.match(cmuxOutput, /Observed topic title/);
		} finally {
			terminal.stop();
			if (previousCmuxBin) process.env.NEXUS_CMUX_BIN = previousCmuxBin;
			else delete process.env.NEXUS_CMUX_BIN;
			if (previousCmuxLog) process.env.CMUX_TEST_LOG = previousCmuxLog;
			else delete process.env.CMUX_TEST_LOG;
			if (previousWorkspaceId) process.env.CMUX_WORKSPACE_ID = previousWorkspaceId;
			else delete process.env.CMUX_WORKSPACE_ID;
			if (previousSurfaceId) process.env.CMUX_SURFACE_ID = previousSurfaceId;
			else delete process.env.CMUX_SURFACE_ID;
			await removeFakeCmuxExecutable(fakeCmux.directoryPath);
		}
	});
});
