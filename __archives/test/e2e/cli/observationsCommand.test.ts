import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";
import { createCliSessionFixture } from "./createCliSessionFixture.js";
import { pathExists } from "./pathExists.js";

/**
 * Reads the first persisted user entry id from a session JSONL file.
 *
 * @param sessionPath Session JSONL path.
 * @returns First user message entry id.
 */
async function readFirstUserEntryId(sessionPath: string): Promise<string> {
  const lines = (await readFile(sessionPath, "utf8")).trim().split(/\r?\n/);
  for (const line of lines) {
    const entry = JSON.parse(line) as { id?: string; type?: string; message?: { role?: string } };
    if (entry.type === "message" && entry.message?.role === "user" && entry.id) return entry.id;
  }
  throw new Error("Missing user entry id in fixture session");
}

test("nexus observations recreates, lists, locates, and deletes observation artifacts", async () => {
  const homeDir = await createReleaseTestHome();
  const env = { ...createReleaseTestEnv(homeDir), PI_OFFLINE: "1" };
  const { sessionDir, sessionId, sessionPath } = await createCliSessionFixture();
  const observationsDir = join(homeDir, ".local", "share", "nexus", "agent", "observations");
  const conversationId = sessionPath.split("/").at(-1)!.replace(/\.jsonl$/, "");
  const messagesPath = join(observationsDir, `${conversationId}.messages.json`);
  const statePath = join(observationsDir, `${conversationId}.json`);
  const legacyStatePath = join(observationsDir, `${conversationId}.state.json`);
  const markdownPath = join(observationsDir, `${conversationId}.observations.md`);

  try {
    const locationResult = await runCommand(buildSourceCliCommand(["observations", "get-location"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(locationResult.code, 0);
    assert.equal(locationResult.output.trim(), observationsDir);

    const recreateResult = await runCommand(buildSourceCliCommand(["observations", "recreate", sessionId, "--session-dir", sessionDir]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(recreateResult.code, 0);
    assert.match(recreateResult.output, /Recreated 1 observation group/);
    assert.equal(await pathExists(messagesPath), false);
    assert.equal(await pathExists(statePath), true);
    assert.equal(await pathExists(markdownPath), false);
    assert.equal(await pathExists(legacyStatePath), false);

    const state = JSON.parse(await readFile(statePath, "utf8")) as { messageCount?: number };
    assert.equal(state.messageCount, 2);
    assert.match(await readFile(sessionPath, "utf8"), new RegExp(await readFirstUserEntryId(sessionPath)));

    const recreateByConversationIdResult = await runCommand(buildSourceCliCommand(["observations", "recreate", conversationId, "--session-dir", sessionDir]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(recreateByConversationIdResult.code, 0);
    assert.match(recreateByConversationIdResult.output, /Recreated 1 observation group/);

    const jsonListResult = await runCommand(buildSourceCliCommand(["observations", "list", "all", "--json"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(jsonListResult.code, 0);
    const rows = JSON.parse(jsonListResult.output) as Array<{ sessionId: string; messageCount: number; topicCount: number }>;
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.sessionId, sessionId);
    assert.equal(rows[0]?.messageCount, 2);
    assert.equal(rows[0]?.topicCount, 0);

    const tableListResult = await runCommand(buildSourceCliCommand(["observations", "list", sessionId]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(tableListResult.code, 0);
    assert.match(tableListResult.output, new RegExp(sessionId));

    const viewResult = await runCommand(buildSourceCliCommand(["observations", "view", sessionId]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(viewResult.code, 0);
    assert.match(viewResult.output, new RegExp(`# Observations for ${conversationId}`));

    const deleteResult = await runCommand(buildSourceCliCommand(["observations", "delete", sessionId]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(deleteResult.code, 0);
    assert.match(deleteResult.output, /Deleted 1 observation group/);
    assert.equal(await pathExists(statePath), false);
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});

test("nexus --delete-session removes matching observation artifacts", async () => {
  const homeDir = await createReleaseTestHome();
  const env = { ...createReleaseTestEnv(homeDir), PI_OFFLINE: "1" };
  const { sessionDir, sessionId, sessionPath } = await createCliSessionFixture();
  const observationsDir = join(homeDir, ".local", "share", "nexus", "agent", "observations");
  const conversationId = sessionPath.split("/").at(-1)!.replace(/\.jsonl$/, "");
  const messagesPath = join(observationsDir, `${conversationId}.messages.json`);
  const statePath = join(observationsDir, `${conversationId}.json`);
  const legacyStatePath = join(observationsDir, `${conversationId}.state.json`);

  try {
    const recreateResult = await runCommand(buildSourceCliCommand(["observations", "recreate", sessionId, "--session-dir", sessionDir]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(recreateResult.code, 0);
    assert.equal(await pathExists(messagesPath), false);
    assert.equal(await pathExists(statePath), true);
    assert.equal(await pathExists(legacyStatePath), false);

    const deleteSessionResult = await runCommand(buildSourceCliCommand(["--session-dir", sessionDir, "--delete-session", sessionId]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(deleteSessionResult.code, 0);
    assert.match(deleteSessionResult.output, /Deleted 1 observation group/);
    assert.equal(await pathExists(statePath), false);
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});
