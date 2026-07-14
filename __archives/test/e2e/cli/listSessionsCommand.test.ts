import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";
import { createCliSessionFixture } from "./createCliSessionFixture.js";
import { createNexusCliSessionFixture } from "./createNexusCliSessionFixture.js";
import { createNexusCliSessionFixtureForCwd } from "./createNexusCliSessionFixtureForCwd.js";

test("nexus --sessions prints resumable sessions as a table", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const { sessionDir, sessionId } = await createCliSessionFixture();

  try {
    const result = await runCommand(buildSourceCliCommand(["--sessions", "--session-dir", sessionDir]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.match(result.output, /│ Date\s+│ Session title\s+│ Session ID\s+│/m);
    assert.match(result.output, new RegExp(`│ \\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} │ CLI resume fixture\\s+│ ${sessionId}\\s+│`, "m"));
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});

test("nexus --sessions --json prints current-folder sessions as JSON", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const { sessionDir, sessionId } = await createCliSessionFixture();

  try {
    const result = await runCommand(buildSourceCliCommand(["--sessions", "--session-dir", sessionDir, "--json"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    const rows = JSON.parse(result.output) as Array<{ id: string; title: string }>;
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.id, sessionId);
    assert.equal(rows[0]?.title, "CLI resume fixture");
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});

test("just dev --sessions prints resumable sessions as a table", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const { sessionId } = await createNexusCliSessionFixture(homeDir);

  try {
    const result = await runCommand("just dev --sessions", {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.match(result.output, /│ Date\s+│ Session title\s+│ Session ID\s+│/m);
    assert.match(result.output, new RegExp(`│ \\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} │ CLI resume fixture\\s+│ ${sessionId}\\s+│`, "m"));
  } finally {
    await removeReleaseTestHome(homeDir);
  }
});

test("nexus --sessions-all prints sessions from every folder", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const foreignCwd = await mkdtemp(join(tmpdir(), "nexus-cli-foreign-cwd-"));
  const currentSession = await createNexusCliSessionFixtureForCwd(homeDir, process.cwd(), "Current folder session");
  const foreignSession = await createNexusCliSessionFixtureForCwd(homeDir, foreignCwd, "Foreign folder session");

  try {
    const result = await runCommand(buildSourceCliCommand(["--sessions-all"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.match(result.output, /│ Date\s+│ Session title\s+│ Session ID\s+│/m);
    assert.match(result.output, new RegExp(`Current folder session\\s+│ ${currentSession.sessionId}`, "m"));
    assert.match(result.output, new RegExp(`Foreign folder session\\s+│ ${foreignSession.sessionId}`, "m"));
  } finally {
    await rm(foreignCwd, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});

test("nexus --sessions-all --json returns all sessions as JSON", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const foreignCwd = await mkdtemp(join(tmpdir(), "nexus-cli-foreign-json-cwd-"));
  const currentSession = await createNexusCliSessionFixtureForCwd(homeDir, process.cwd(), "Current JSON session");
  const foreignSession = await createNexusCliSessionFixtureForCwd(homeDir, foreignCwd, "Foreign JSON session");

  try {
    const result = await runCommand(buildSourceCliCommand(["--sessions-all", "--json"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    const rows = JSON.parse(result.output) as Array<{ id: string; title: string; cwd: string }>;
    assert.deepEqual(rows.map((row) => row.id).sort(), [currentSession.sessionId, foreignSession.sessionId].sort());
    assert.equal(rows.find((row) => row.id === currentSession.sessionId)?.title, "Current JSON session");
    assert.equal(rows.find((row) => row.id === foreignSession.sessionId)?.title, "Foreign JSON session");
    assert.equal(rows.find((row) => row.id === foreignSession.sessionId)?.cwd, foreignCwd);
  } finally {
    await rm(foreignCwd, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});
