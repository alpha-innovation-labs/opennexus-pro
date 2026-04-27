import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildMemoryBlock, buildReadOnlyMemoryBlock, resolveMemoryDir } from "../../../packages/extensions/src/sub-agents/memory.js";

/**
 * Saves and restores the HOME environment variable for homedir()-based lookups.
 *
 * @param homeDir Replacement HOME value.
 * @returns Cleanup callback.
 */
function withHomeDir(homeDir: string): () => void {
  const previousHome = process.env.HOME;
  process.env.HOME = homeDir;
  return () => {
    if (previousHome === undefined) {
      delete process.env.HOME;
      return;
    }
    process.env.HOME = previousHome;
  };
}

/**
 * Creates one temporary sandbox for memory-path assertions.
 *
 * @returns Project cwd and home directory paths.
 */
async function createMemorySandbox(): Promise<{ cwd: string; homeDir: string }> {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-subagents-memory-cwd-"));
  const homeDir = await mkdtemp(join(tmpdir(), "nexus-subagents-memory-home-"));
  return { cwd, homeDir };
}

test("resolveMemoryDir uses .nexus directories for all scopes", () => {
  assert.equal(resolveMemoryDir("auditor", "project", "/workspace"), "/workspace/.nexus/agent-memory/auditor");
  assert.equal(resolveMemoryDir("auditor", "local", "/workspace"), "/workspace/.nexus/agent-memory-local/auditor");
  assert.match(resolveMemoryDir("auditor", "user", "/workspace"), /\.nexus\/agent-memory\/auditor$/u);
});

test("buildMemoryBlock and buildReadOnlyMemoryBlock read .nexus memory snapshots", async () => {
  const { cwd, homeDir } = await createMemorySandbox();
  const restoreHome = withHomeDir(homeDir);

  try {
    const memoryDir = join(cwd, ".nexus", "agent-memory", "test-agent");
    await mkdir(memoryDir, { recursive: true });
    await writeFile(join(memoryDir, "MEMORY.md"), "# Existing\n- remember this");

    const block = buildMemoryBlock("test-agent", "project", cwd);
    assert.match(block, /\.nexus\/agent-memory\/test-agent/u);
    assert.match(block, /Existing/);
    assert.match(block, /remember this/);

    const readOnlyBlock = buildReadOnlyMemoryBlock("test-agent", "project", cwd);
    assert.match(readOnlyBlock, /read-only/i);
    assert.match(readOnlyBlock, /Existing/);
    assert.match(readOnlyBlock, /remember this/);
  } finally {
    restoreHome();
  }
});
