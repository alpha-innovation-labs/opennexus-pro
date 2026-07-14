import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "../cli/buildSourceCliCommand.js";

/**
 * Reads JSONL queue rows from a steer queue file.
 *
 * @param filePath Queue file path.
 * @returns Parsed queue rows.
 */
async function readQueueRows(filePath: string): Promise<Array<{ sessionId: string; message: string }>> {
  const text = await readFile(filePath, "utf8");
  return text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

test("nexus steer <session-id> <message> writes a steer queue item under the agent dir", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const sessionId = "019dfa81-5a20-77f0-a4cf-c70de99d3418";
  const message = "Focus on the failing e2e path";
  const queuePath = join(env.NEXUS_CODING_AGENT_DIR as string, "steer-queue", `${encodeURIComponent(sessionId)}.jsonl`);

  try {
    const result = await runCommand(buildSourceCliCommand(["steer", sessionId, message]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.match(result.output, /Queued steer for session 019dfa81-5a20-77f0-a4cf-c70de99d3418/u);

    const rows = await readQueueRows(queuePath);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.sessionId, sessionId);
    assert.equal(rows[0]?.message, message);
  } finally {
    await rm(queuePath, { force: true });
    await removeReleaseTestHome(homeDir);
  }
});

test("nexus steer rejects missing message text", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);

  try {
    const result = await runCommand(buildSourceCliCommand(["steer", "019dfa81-5a20-77f0-a4cf-c70de99d3418"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 1);
    assert.match(result.output, /Usage: nexus steer <session-id> <message>/u);
  } finally {
    await removeReleaseTestHome(homeDir);
  }
});
