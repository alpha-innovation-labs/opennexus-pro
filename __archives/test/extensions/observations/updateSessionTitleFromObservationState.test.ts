import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { updateSessionTitleFromObservationState } from "../../../packages/extensions-pro/src/observations/tracker/updateSessionTitleFromObservationState.js";
import { setCmuxTitleSyncEnabled } from "../../../packages/extensions-pro/src/cmux/state/setCmuxTitleSyncEnabled.js";
import { createFakeCmuxExecutable } from "../../support/cmux/createFakeCmuxExecutable.js";
import { removeFakeCmuxExecutable } from "../../support/cmux/removeFakeCmuxExecutable.js";
import { withLockedCmuxEnv } from "../../support/cmux/withLockedCmuxEnv.js";

test("observations mirrors the latest session title into cmux", async () => {
	await withLockedCmuxEnv(async () => {
		const fakeCmux = await createFakeCmuxExecutable();
		const previousCmuxBin = process.env.NEXUS_CMUX_BIN;
		const previousCmuxLog = process.env.CMUX_TEST_LOG;
		const previousWorkspaceId = process.env.CMUX_WORKSPACE_ID;
		const previousSurfaceId = process.env.CMUX_SURFACE_ID;
		let sessionTitle: string | undefined;

		process.env.NEXUS_CMUX_BIN = fakeCmux.executablePath;
		process.env.CMUX_TEST_LOG = fakeCmux.logPath;
		process.env.CMUX_WORKSPACE_ID = "workspace-test";
		process.env.CMUX_SURFACE_ID = "surface-test";
		setCmuxTitleSyncEnabled(true);

		try {
			await updateSessionTitleFromObservationState(
				{
					setSessionName(title: string) {
						sessionTitle = title;
					},
				} as never,
				{
					topics: [{ title: "Observed topic title" }],
				} as never,
			);

			const cmuxArgs = (await readFile(fakeCmux.logPath, "utf8")).trim().split("\n");
			assert.equal(sessionTitle, "Observed topic title");
			assert.deepEqual(cmuxArgs, [
				"rename-tab",
				"--workspace",
				"workspace-test",
				"--surface",
				"surface-test",
				"--title",
				"Observed topic title",
				"workspace-action",
				"--action",
				"rename",
				"--workspace",
				"workspace-test",
				"--title",
				"󰀘  Observed topic title",
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
