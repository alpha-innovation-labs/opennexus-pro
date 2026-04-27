import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { notifyCmuxPaneCompletion } from "../../../packages/extensions/src/cmux/notifyCmuxPaneCompletion.js";
import { setCmuxTitleSyncEnabled } from "../../../packages/extensions/src/cmux/state/setCmuxTitleSyncEnabled.js";
import { createFakeCmuxExecutable } from "../../support/cmux/createFakeCmuxExecutable.js";
import { removeFakeCmuxExecutable } from "../../support/cmux/removeFakeCmuxExecutable.js";
import { withLockedCmuxEnv } from "../../support/cmux/withLockedCmuxEnv.js";

test("cmux emits a pane completion notification", async () => {
	await withLockedCmuxEnv(async () => {
		const fakeCmux = await createFakeCmuxExecutable();
		const previousCmuxBin = process.env.NEXUS_CMUX_BIN;
		const previousCmuxLog = process.env.CMUX_TEST_LOG;
		const previousWorkspaceId = process.env.CMUX_WORKSPACE_ID;
		const previousSurfaceId = process.env.CMUX_SURFACE_ID;

		process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
		process.env.CMUX_TEST_LOG = fakeCmux.logPath;
		process.env.CMUX_WORKSPACE_ID = "workspace-test";
		process.env.CMUX_SURFACE_ID = "surface-test";
		setCmuxTitleSyncEnabled(true);

		try {
			await notifyCmuxPaneCompletion("  Build   finished  ");

			const cmuxArgs = (await readFile(fakeCmux.logPath, "utf8")).trim().split("\n");
			assert.deepEqual(cmuxArgs, [
				"notify",
				"--title",
				"Build finished",
				"--subtitle",
				"Nexus pane done",
				"--workspace",
				"workspace-test",
				"--surface",
				"surface-test",
			]);
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

test("cmux skips pane completion notification while title sync is disabled", async () => {
	await withLockedCmuxEnv(async () => {
		const fakeCmux = await createFakeCmuxExecutable();
		const previousCmuxBin = process.env.NEXUS_CMUX_BIN;
		const previousCmuxLog = process.env.CMUX_TEST_LOG;
		process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
		process.env.CMUX_TEST_LOG = fakeCmux.logPath;
		setCmuxTitleSyncEnabled(false);

		try {
			await notifyCmuxPaneCompletion("Build finished");
			await assert.rejects(readFile(fakeCmux.logPath, "utf8"));
		} finally {
			if (previousCmuxBin) process.env.NEXUS_CMUX_BIN = previousCmuxBin;
			else delete process.env.NEXUS_CMUX_BIN;
			if (previousCmuxLog) process.env.CMUX_TEST_LOG = previousCmuxLog;
			else delete process.env.CMUX_TEST_LOG;
			await removeFakeCmuxExecutable(fakeCmux.directoryPath);
		}
	});
});
