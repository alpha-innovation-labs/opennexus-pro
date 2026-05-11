import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { registerCmuxExtension } from "../../../packages/extensions-pro/src/cmux/registerCmuxExtension.js";
import { getCmuxTitleSyncEnabled } from "../../../packages/extensions-pro/src/cmux/state/getCmuxTitleSyncEnabled.js";
import { setCmuxTitleSyncEnabled } from "../../../packages/extensions-pro/src/cmux/state/setCmuxTitleSyncEnabled.js";
import { createFakeCmuxExecutable } from "../../support/cmux/createFakeCmuxExecutable.js";
import { removeFakeCmuxExecutable } from "../../support/cmux/removeFakeCmuxExecutable.js";
import { withLockedCmuxEnv } from "../../support/cmux/withLockedCmuxEnv.js";

test("cmux enables pane-done notifications during the session and disables them on shutdown", async () => {
	await withLockedCmuxEnv(async () => {
		const fakeCmux = await createFakeCmuxExecutable();
		const previousCmuxBin = process.env.NEXUS_CMUX_BIN;
		const previousCmuxLog = process.env.CMUX_TEST_LOG;
		const previousWorkspaceId = process.env.CMUX_WORKSPACE_ID;
		const previousSurfaceId = process.env.CMUX_SURFACE_ID;
		const previousRegistry = process.env.NEXUS_CMUX_SESSION_REGISTRY;
		const registryDirectory = await mkdtemp(join(tmpdir(), "nexus-cmux-registry-"));
		const registryPath = join(registryDirectory, "registry.json");
		let sessionStartHandler: ((event: unknown, ctx: { sessionManager: { getSessionId(): string; getSessionFile(): string } }) => Promise<void> | void) | undefined;
		let agentEndHandler: (() => Promise<void>) | undefined;
		let shutdownHandler: (() => Promise<void> | void) | undefined;

		process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
		process.env.CMUX_TEST_LOG = fakeCmux.logPath;
		process.env.CMUX_WORKSPACE_ID = "workspace-test";
		process.env.CMUX_SURFACE_ID = "surface-test";
		process.env.NEXUS_CMUX_SESSION_REGISTRY = registryPath;
		setCmuxTitleSyncEnabled(false);

		try {
			registerCmuxExtension(
				{
					getSessionName() {
						return "Observed topic title";
					},
					on(eventName: string, handler: (...args: never[]) => Promise<void> | void) {
						if (eventName === "session_start") sessionStartHandler = handler as never;
						if (eventName === "agent_end") agentEndHandler = async () => await handler();
						if (eventName === "session_shutdown") shutdownHandler = handler;
					},
					registerCommand() {},
					registerMessageRenderer() {},
				} as never,
			);

			assert.equal(getCmuxTitleSyncEnabled(), true);
			assert.ok(sessionStartHandler);
			assert.ok(agentEndHandler);
			assert.ok(shutdownHandler);

			await sessionStartHandler?.({}, {
				sessionManager: {
					getSessionId: () => "session-test-id",
					getSessionFile: () => "/tmp/session-test.jsonl",
				},
			});
			const registryOutput = await readFile(registryPath, "utf8");
			assert.match(registryOutput, /session-test-id/);
			assert.match(registryOutput, /surface-test/);

			await agentEndHandler?.();
			const cmuxArgs = (await readFile(fakeCmux.logPath, "utf8")).trim().split("\n");
			assert.deepEqual(cmuxArgs, [
				"notify",
				"--title",
				"Observed topic title",
				"--subtitle",
				"Nexus pane done",
				"--workspace",
				"workspace-test",
				"--surface",
				"surface-test",
			]);

			await shutdownHandler?.();
			assert.equal(getCmuxTitleSyncEnabled(), false);
			const clearedRegistryOutput = await readFile(registryPath, "utf8");
			assert.doesNotMatch(clearedRegistryOutput, /session-test-id/);
		} finally {
			setCmuxTitleSyncEnabled(false);
			if (previousCmuxBin) process.env.NEXUS_CMUX_BIN = previousCmuxBin;
			else delete process.env.NEXUS_CMUX_BIN;
			if (previousCmuxLog) process.env.CMUX_TEST_LOG = previousCmuxLog;
			else delete process.env.CMUX_TEST_LOG;
			if (previousWorkspaceId) process.env.CMUX_WORKSPACE_ID = previousWorkspaceId;
			else delete process.env.CMUX_WORKSPACE_ID;
			if (previousSurfaceId) process.env.CMUX_SURFACE_ID = previousSurfaceId;
			else delete process.env.CMUX_SURFACE_ID;
			if (previousRegistry) process.env.NEXUS_CMUX_SESSION_REGISTRY = previousRegistry;
			else delete process.env.NEXUS_CMUX_SESSION_REGISTRY;
			await removeFakeCmuxExecutable(fakeCmux.directoryPath);
			await rm(registryDirectory, { recursive: true, force: true });
		}
	});
});
