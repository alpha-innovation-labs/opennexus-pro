import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { prunePromptQueueFiles } from "../../packages/extensions/src/prompt-queue/prunePromptQueueFiles.js";

test("prompt queue pruning removes only files for sessions that no longer exist", async () => {
  const root = await mkdtemp(join(tmpdir(), "nexus-prompt-queue-"));
  const queueDir = join(root, "queue");
  const sessionDir = join(root, "sessions");
  await writeFile(join(queueDir, "live-session.json"), "[]\n", { flag: "w" }).catch(async () => {
    await import("node:fs/promises").then(({ mkdir }) => mkdir(queueDir, { recursive: true }));
    await writeFile(join(queueDir, "live-session.json"), "[]\n");
  });
  await writeFile(join(queueDir, "deleted-session.json"), "[]\n");
  await import("node:fs/promises").then(({ mkdir }) => mkdir(sessionDir, { recursive: true }));
  await writeFile(join(sessionDir, "2026-01-01_live-session.jsonl"), "{}\n");

  const removed = await prunePromptQueueFiles(queueDir, sessionDir);
  const remaining = await readdir(queueDir);

  assert.deepEqual(removed, ["deleted-session"]);
  assert.deepEqual(remaining, ["live-session.json"]);
  await rm(root, { recursive: true, force: true });
});
