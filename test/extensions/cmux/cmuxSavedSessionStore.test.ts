import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createCmuxSavedSession } from "../../../packages/extensions/src/cmux/snapshots/createCmuxSavedSession.js";
import { createCmuxSavedSessionItems } from "../../../packages/extensions/src/cmux/snapshots/createCmuxSavedSessionItems.js";
import { deleteCmuxSavedSession } from "../../../packages/extensions/src/cmux/snapshots/deleteCmuxSavedSession.js";
import { writeCmuxSavedSessionStore } from "../../../packages/extensions/src/cmux/snapshots/writeCmuxSavedSessionStore.js";
import { readCmuxSavedSessionStore } from "../../../packages/extensions/src/cmux/snapshots/readCmuxSavedSessionStore.js";

test("cmux saved sessions persist named workspace pane snapshots", async () => {
	const directory = await mkdtemp(join(tmpdir(), "nexus-cmux-saved-"));
	const storePath = join(directory, "sessions.json");
	const previousStorePath = process.env.NEXUS_CMUX_SAVED_SESSIONS;
	process.env.NEXUS_CMUX_SAVED_SESSIONS = storePath;
	try {
		const snapshot = createCmuxSavedSession("Morning layout", ["󰀘  Workspace", "  󰀘  Build agent"], [{ title: "Workspace", panes: [{ title: "Build agent", sessionId: "session-1", sessionTitle: "Build agent" }] }]);
		await writeCmuxSavedSessionStore(storePath, { version: 1, sessions: [snapshot] });

		const store = await readCmuxSavedSessionStore(storePath);
		assert.equal(store.sessions[0]?.name, "Morning layout");
		assert.deepEqual(store.sessions[0]?.lines, ["󰀘  Workspace", "  󰀘  Build agent"]);
		assert.equal(store.sessions[0]?.workspaces?.[0]?.panes[0]?.sessionId, "session-1");
		assert.equal(createCmuxSavedSessionItems(store.sessions)[0]?.label, "Morning layout");
		assert.match(await readFile(storePath, "utf8"), /Morning layout/);

		await deleteCmuxSavedSession(snapshot.id);
		const updatedStore = await readCmuxSavedSessionStore(storePath);
		assert.equal(updatedStore.sessions.length, 0);
	} finally {
		if (previousStorePath) process.env.NEXUS_CMUX_SAVED_SESSIONS = previousStorePath;
		else delete process.env.NEXUS_CMUX_SAVED_SESSIONS;
		await rm(directory, { recursive: true, force: true });
	}
});
