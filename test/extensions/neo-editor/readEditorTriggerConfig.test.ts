import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readEditorTriggerConfig } from "../../../packages/extension-core/src/neo-editor/features/editor-triggers/readEditorTriggerConfig.js";

/**
 * Restores the user config directory environment variable.
 *
 * @param value Previous environment value.
 */
function restoreConfigDirEnv(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.NEXUS_CONFIG_DIR;
  } else {
    process.env.NEXUS_CONFIG_DIR = value;
  }
}

test("readEditorTriggerConfig includes bundled submit triggers without user config files", async () => {
  const previousConfigDir = process.env.NEXUS_CONFIG_DIR;
  const cwd = await mkdtemp(join(tmpdir(), "nexus-trigger-default-cwd-"));
  const configDir = await mkdtemp(join(tmpdir(), "nexus-trigger-default-config-"));

  try {
    process.env.NEXUS_CONFIG_DIR = configDir;

    const config = await readEditorTriggerConfig(cwd);

    assert.ok(config.rules.some((rule) => rule.match.text === "/reload" && rule.action.type === "submit"));
    assert.ok(config.rules.some((rule) => rule.match.text === "/sessions" && rule.action.type === "submit"));
  } finally {
    restoreConfigDirEnv(previousConfigDir);
    await rm(cwd, { recursive: true, force: true });
    await rm(configDir, { recursive: true, force: true });
  }
});
