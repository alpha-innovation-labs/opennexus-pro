import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { registerCmuxExtension } from "../../../src/extensions/cmux/registerCmuxExtension.js";
import { getCmuxTitleSyncEnabled } from "../../../src/extensions/cmux/state/getCmuxTitleSyncEnabled.js";
import { setCmuxTitleSyncEnabled } from "../../../src/extensions/cmux/state/setCmuxTitleSyncEnabled.js";
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
		let agentEndHandler: (() => Promise<void>) | undefined;
		let shutdownHandler: (() => void) | undefined;

		process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
		process.env.CMUX_TEST_LOG = fakeCmux.logPath;
		process.env.CMUX_WORKSPACE_ID = "workspace-test";
		process.env.CMUX_SURFACE_ID = "surface-test";
		setCmuxTitleSyncEnabled(false);

		try {
			registerCmuxExtension(
				{
					getSessionName() {
						return "Observed topic title";
					},
					on(eventName: string, handler: () => Promise<void> | void) {
						if (eventName === "agent_end") agentEndHandler = async () => await handler();
						if (eventName === "session_shutdown") shutdownHandler = handler;
					},
				} as never,
			);

			assert.equal(getCmuxTitleSyncEnabled(), true);
			assert.ok(agentEndHandler);
			assert.ok(shutdownHandler);

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

			shutdownHandler?.();
			assert.equal(getCmuxTitleSyncEnabled(), false);
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
			await removeFakeCmuxExecutable(fakeCmux.directoryPath);
		}
	});
});
