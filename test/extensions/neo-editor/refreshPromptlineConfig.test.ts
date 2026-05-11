import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearPromptlineConfig } from "../../../packages/extension-core/src/neo-editor/features/promptline/config/clearPromptlineConfig.js";
import { getPromptlineConfig } from "../../../packages/extension-core/src/neo-editor/features/promptline/config/getPromptlineConfig.js";
import { refreshPromptlineConfig } from "../../../packages/extension-core/src/neo-editor/features/promptline/config/refreshPromptlineConfig.js";

/**
 * Creates one temporary project and user config sandbox.
 *
 * @returns Temporary cwd and config dir.
 */
async function createConfigSandbox(): Promise<{ cwd: string; configDir: string }> {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-promptline-cwd-"));
  const configDir = await mkdtemp(join(tmpdir(), "nexus-promptline-config-"));
  await mkdir(join(cwd, ".nexus", "extensions", "neo-editor"), { recursive: true });
  return { cwd, configDir };
}

test.afterEach(() => {
  clearPromptlineConfig();
});

test("refreshPromptlineConfig caches trigger rules and Neo settings from disk", async () => {
  const originalConfigDir = process.env.NEXUS_CONFIG_DIR;
  const { cwd, configDir } = await createConfigSandbox();

  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    await writeFile(join(configDir, "editor-triggers.json"), JSON.stringify({ rules: [{ match: { text: "/reload" }, action: { type: "submit" } }] }));
    await writeFile(join(cwd, ".nexus", "extensions", "neo-editor", "config.json"), JSON.stringify({ clearEditorOnTriggerSubmit: false }));

    const config = await refreshPromptlineConfig(cwd);

    assert.ok(config.triggerConfig.rules.some((rule) => rule.match.text === "/reload" && rule.action.type === "submit"));
    assert.equal(config.neoConfig.clearEditorOnTriggerSubmit, false);
    assert.deepEqual(getPromptlineConfig(), config);
  } finally {
    if (originalConfigDir === undefined) delete process.env.NEXUS_CONFIG_DIR;
    else process.env.NEXUS_CONFIG_DIR = originalConfigDir;
    await rm(cwd, { recursive: true, force: true });
    await rm(configDir, { recursive: true, force: true });
  }
});
