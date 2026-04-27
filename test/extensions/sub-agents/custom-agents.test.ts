import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadCustomAgents } from "../../../packages/extensions/src/sub-agents/custom-agents.js";

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
 * Creates one temp project and home config sandbox.
 *
 * @returns Cwd and home directory paths.
 */
async function createAgentSandbox(): Promise<{ cwd: string; homeDir: string }> {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-subagents-cwd-"));
  const homeDir = await mkdtemp(join(tmpdir(), "nexus-subagents-home-"));
  return { cwd, homeDir };
}

test("loadCustomAgents reads .nexus agent files and ignores legacy .pi files", async () => {
  const { cwd, homeDir } = await createAgentSandbox();
  const restoreHome = withHomeDir(homeDir);

  try {
    await mkdir(join(cwd, ".nexus", "agents"), { recursive: true });
    await mkdir(join(cwd, ".pi", "agents"), { recursive: true });
    await mkdir(join(homeDir, ".nexus", "agent", "agents"), { recursive: true });

    await writeFile(
      join(cwd, ".nexus", "agents", "project.md"),
      [
        "---",
        "description: Project agent",
        "tools: read, grep",
        "---",
        "Project prompt.",
      ].join("\n"),
    );

    await writeFile(
      join(homeDir, ".nexus", "agent", "agents", "global.md"),
      [
        "---",
        "description: Global agent",
        "tools: read",
        "---",
        "Global prompt.",
      ].join("\n"),
    );

    await writeFile(
      join(cwd, ".pi", "agents", "ignored.md"),
      [
        "---",
        "description: Legacy agent",
        "---",
        "Legacy prompt.",
      ].join("\n"),
    );

    const agents = loadCustomAgents(cwd);

    assert.equal(agents.has("ignored"), false);
    assert.equal(agents.get("project")?.description, "Project agent");
    assert.equal(agents.get("project")?.systemPrompt, "Project prompt.");
    assert.equal(agents.get("project")?.builtinToolNames?.join(","), "read,grep");
    assert.equal(agents.get("global")?.description, "Global agent");
    assert.equal(agents.get("global")?.systemPrompt, "Global prompt.");
  } finally {
    restoreHome();
  }
});

/**
 * Verifies project .nexus agents override matching global ones.
 */
test("loadCustomAgents prefers project .nexus agents over global ones", async () => {
  const { cwd, homeDir } = await createAgentSandbox();
  const restoreHome = withHomeDir(homeDir);

  try {
    await mkdir(join(cwd, ".nexus", "agents"), { recursive: true });
    await mkdir(join(homeDir, ".nexus", "agent", "agents"), { recursive: true });

    await writeFile(
      join(homeDir, ".nexus", "agent", "agents", "auditor.md"),
      [
        "---",
        "description: Global auditor",
        "---",
        "Global prompt.",
      ].join("\n"),
    );

    await writeFile(
      join(cwd, ".nexus", "agents", "auditor.md"),
      [
        "---",
        "description: Project auditor",
        "---",
        "Project prompt.",
      ].join("\n"),
    );

    const agents = loadCustomAgents(cwd);
    assert.equal(agents.get("auditor")?.description, "Project auditor");
    assert.equal(agents.get("auditor")?.systemPrompt, "Project prompt.");
  } finally {
    restoreHome();
  }
});
