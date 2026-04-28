import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createExtensionRuntime, loadExtensionFromFactory } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/extensions/loader.js";
import { ExtensionRunner } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/extensions/runner.js";
import { createEventBus } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/event-bus.js";
import { clearCmuxWorkspaceShellLinesCache } from "../../../packages/extensions/src/cmux/workspace-cache/clearCmuxWorkspaceShellLinesCache.js";
import { registerCmuxExtension } from "../../../packages/extensions/src/cmux/registerCmuxExtension.js";
import { createFakeCmuxWorkspaceExecutable } from "../../support/cmux/createFakeCmuxWorkspaceExecutable.js";
import { removeFakeCmuxExecutable } from "../../support/cmux/removeFakeCmuxExecutable.js";
import { withLockedCmuxEnv } from "../../support/cmux/withLockedCmuxEnv.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const REGISTRY_ENV = "NEXUS_CMUX_SESSION_REGISTRY";
const SAVED_SESSIONS_ENV = "NEXUS_CMUX_SAVED_SESSIONS";

test("/cmux opens a modal with workspaces and Nexus session ids", async () => {
	await withLockedCmuxEnv(async () => {
		clearCmuxWorkspaceShellLinesCache();
		const fakeCmux = await createFakeCmuxWorkspaceExecutable();
		const registryDirectory = await mkdtemp(join(tmpdir(), "nexus-cmux-command-test-"));
		const registryPath = join(registryDirectory, `registry-${process.pid}.json`);
		const previousCmuxBin = process.env.NEXUS_CMUX_BIN;
		const previousCmuxLog = process.env.CMUX_TEST_LOG;
		const savedSessionsPath = join(registryDirectory, "saved-sessions.json");
		const previousRegistry = process.env[REGISTRY_ENV];
		const previousSavedSessions = process.env[SAVED_SESSIONS_ENV];
		const previousDelay = process.env.CMUX_TEST_DELAY;
		let renderedModal = "";
		let notification = "";
		let secondNotification = "";
		let nextActionKey: string | undefined;
		let nextSavedMenuKey: string | undefined;
		let customCallCount = 0;
		let renderComponent: { render(width: number): string[]; handleInput?(data: string): void } | undefined;

		process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
		process.env.CMUX_TEST_LOG = fakeCmux.logPath;
		process.env.CMUX_TEST_DELAY = "0.05";
		process.env[REGISTRY_ENV] = registryPath;
		process.env[SAVED_SESSIONS_ENV] = savedSessionsPath;
		await writeFile(
			registryPath,
			JSON.stringify({
				version: 1,
				entries: [
					{
						workspaceId: "workspace-nexus",
						surfaceId: "surface-nexus",
						sessionId: "session-abc123",
						sessionTitle: "Improve cmux modal",
						pid: process.pid,
						updatedAt: new Date().toISOString(),
					},
				],
			}),
			"utf8",
		);

		try {
			const runtime = createExtensionRuntime();
			const eventBus = createEventBus();
			const extension = await loadExtensionFromFactory(registerCmuxExtension, process.cwd(), eventBus, runtime, "<cmux-command-test>");
			const runner = new ExtensionRunner([extension], runtime, process.cwd(), {
				getSessionId: () => "current-session",
				getSessionFile: () => undefined,
			} as never, {} as never);
			runner.bindCore({
				sendMessage() {},
				sendUserMessage() {},
				appendEntry() {},
				setSessionName() {},
				getSessionName() {
					return "Current session";
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
			} as never, {
				getModel: () => undefined,
				isIdle: () => true,
				getSignal: () => undefined,
				abort() {},
				hasPendingMessages: () => false,
				shutdown() {},
				getContextUsage: () => undefined,
				compact() {},
				getSystemPrompt: () => "",
			} as never);
			runner.bindCommandContext();
			runner.setUIContext({
				custom: async (factory: (tui: { requestRender(): void }, theme: unknown, keybindings: unknown, done: (value?: unknown) => void) => { render(width: number): string[]; handleInput?(data: string): void }) => {
					customCallCount += 1;
					let doneValue: unknown;
					const component = factory({
						requestRender() {
							renderedModal = renderComponent?.render(120).join("\n") ?? renderedModal;
						},
					}, createTestTheme(), {}, (value?: unknown) => {
						doneValue = value;
					});
					renderComponent = component;
					renderedModal = component.render(120).join("\n");
					if (customCallCount === 1 && nextActionKey) component.handleInput?.(nextActionKey);
					if (customCallCount === 2 && nextSavedMenuKey) component.handleInput?.(nextSavedMenuKey);
					return doneValue;
				},
				input: async () => "Saved cmux layout",
				notify: (message: string) => {
					secondNotification = notification;
					notification = message;
				},
				get theme() {
					return createTestTheme() as never;
				},
			} as never);

			const command = runner.getCommand("cmux");
			assert.ok(command);
			await command.handler("", runner.createCommandContext());

			assert.match(renderedModal, /cmux workspaces/);
			assert.match(renderedModal, /Loading workspaces/);
			assert.match(renderedModal, /s save · l load/);

			for (let attempt = 0; attempt < 30 && !/Engineering/.test(renderedModal); attempt += 1) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
			assert.match(renderedModal, /󰀘  Engineering/);
			assert.match(renderedModal, /󰀘  Improve cmux modal/);
			assert.doesNotMatch(renderedModal, /session-abc123/);
			assert.doesNotMatch(renderedModal, /nexus - old title/);
			assert.doesNotMatch(renderedModal, /workspace:1/);
			assert.doesNotMatch(renderedModal, /pane:1/);
			assert.doesNotMatch(renderedModal, /surface:1/);
			assert.match(renderedModal, /Ops/);
			assert.match(renderedModal, /󰆍 zsh/);

			nextActionKey = "s";
			customCallCount = 0;
			await command.handler("", runner.createCommandContext());
			assert.match(notification, /Saved cmux session: Saved cmux layout/);

			nextActionKey = undefined;
			customCallCount = 0;
			await command.handler("", runner.createCommandContext());
			assert.doesNotMatch(renderedModal, /Loading workspaces/);
			assert.match(renderedModal, /󰀘  Engineering/);

			nextActionKey = "l";
			customCallCount = 0;
			await command.handler("", runner.createCommandContext());
			assert.match(renderedModal, /Saved sessions/);
			assert.match(renderedModal, /Saved cmux layout/);
			assert.match(renderedModal, /Workspaces \/ panes/);

			renderComponent?.handleInput?.("d");
			assert.match(notification, /Deleted cmux session snapshot/);
			assert.match(secondNotification, /Saved cmux session: Saved cmux layout/);
			renderedModal = renderComponent?.render(120).join("\n") ?? renderedModal;
			assert.doesNotMatch(renderedModal, /Saved cmux layout/);

			await writeFile(savedSessionsPath, JSON.stringify({
				version: 1,
				sessions: [{
					id: "saved-back-test",
					name: "Back test layout",
					createdAt: new Date().toISOString(),
					lines: ["Back test preview"],
				}],
			}), "utf8");
			nextActionKey = "l";
			nextSavedMenuKey = "\u001b";
			customCallCount = 0;
			await command.handler("", runner.createCommandContext());
			assert.match(renderedModal, /cmux workspaces/);
			assert.match(renderedModal, /s save · l load/);
		} finally {
			if (previousCmuxBin) process.env.NEXUS_CMUX_BIN = previousCmuxBin;
			else delete process.env.NEXUS_CMUX_BIN;
			if (previousCmuxLog) process.env.CMUX_TEST_LOG = previousCmuxLog;
			else delete process.env.CMUX_TEST_LOG;
			if (previousRegistry) process.env[REGISTRY_ENV] = previousRegistry;
			else delete process.env[REGISTRY_ENV];
			if (previousSavedSessions) process.env[SAVED_SESSIONS_ENV] = previousSavedSessions;
			else delete process.env[SAVED_SESSIONS_ENV];
			if (previousDelay) process.env.CMUX_TEST_DELAY = previousDelay;
			else delete process.env.CMUX_TEST_DELAY;
			clearCmuxWorkspaceShellLinesCache();
			await removeFakeCmuxExecutable(fakeCmux.directoryPath);
			await rm(registryDirectory, { recursive: true, force: true });
		}
	});
});
