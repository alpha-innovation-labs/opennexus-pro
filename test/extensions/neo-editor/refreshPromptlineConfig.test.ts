import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearPromptlineConfig } from "../../../src/extensions/neo-editor/features/promptline/config/clearPromptlineConfig.js";
import { getPromptlineConfig } from "../../../src/extensions/neo-editor/features/promptline/config/getPromptlineConfig.js";
import { refreshPromptlineConfig } from "../../../src/extensions/neo-editor/features/promptline/config/refreshPromptlineConfig.js";

/**
 * Creates one temporary project and agent config sandbox.
 *
 * @returns Temporary cwd and agent dir.
 */
async function createConfigSandbox(): Promise<{ cwd: string; agentDir: string }> {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-promptline-cwd-"));
  const agentDir = await mkdtemp(join(tmpdir(), "nexus-promptline-agent-"));
  await mkdir(join(cwd, ".nexus", "extensions", "neo-editor"), { recursive: true });
  return { cwd, agentDir };
}

test.afterEach(() => {
  clearPromptlineConfig();
});

test("refreshPromptlineConfig caches trigger rules and Neo settings from disk", async () => {
  const originalAgentDir = process.env.NEXUS_CODING_AGENT_DIR;
  const originalPiAgentDir = process.env.PI_CODING_AGENT_DIR;
  const { cwd, agentDir } = await createConfigSandbox();

  try {
    process.env.NEXUS_CODING_AGENT_DIR = agentDir;
    process.env.PI_CODING_AGENT_DIR = agentDir;
    await writeFile(join(agentDir, "editor-triggers.json"), JSON.stringify({ rules: [{ match: { text: "/reload" }, action: { type: "submit" } }] }));
    await writeFile(join(cwd, ".nexus", "extensions", "neo-editor", "config.json"), JSON.stringify({ clearEditorOnTriggerSubmit: false }));

    const config = await refreshPromptlineConfig(cwd);

    assert.deepEqual(config.triggerConfig.rules, [{ match: { text: "/reload" }, action: { type: "submit" } }]);
    assert.equal(config.neoConfig.clearEditorOnTriggerSubmit, false);
    assert.deepEqual(getPromptlineConfig(), config);
  } finally {
    if (originalAgentDir === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = originalAgentDir;
    if (originalPiAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = originalPiAgentDir;
    await rm(cwd, { recursive: true, force: true });
    await rm(agentDir, { recursive: true, force: true });
  }
});
