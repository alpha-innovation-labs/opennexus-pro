import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { listSessions } from "../../../apps/tui/src/cli/sessions/listSessions.js";

test("listSessions returns oldest sessions first so the most recent session is at the bottom", async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), "nexus-cli-session-order-"));
  const older = SessionManager.create(process.cwd(), sessionDir);
  older.appendMessage({ role: "user", content: [{ type: "text", text: "Older prompt" }], timestamp: 1_000 } as never);
  older.appendMessage({ role: "assistant", content: [{ type: "text", text: "Older answer" }], timestamp: 2_000 } as never);

  const newer = SessionManager.create(process.cwd(), sessionDir);
  newer.appendMessage({ role: "user", content: [{ type: "text", text: "Newer prompt" }], timestamp: 3_000 } as never);
  newer.appendMessage({ role: "assistant", content: [{ type: "text", text: "Newer answer" }], timestamp: 4_000 } as never);

  try {
    const sessions = await listSessions(process.cwd(), sessionDir);

    assert.deepEqual(sessions.map((session) => session.id), [older.getSessionId(), newer.getSessionId()]);
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
  }
});
