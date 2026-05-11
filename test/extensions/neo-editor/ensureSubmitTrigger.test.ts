import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { ensureSubmitTrigger } from "../../../packages/extension-core/src/neo-editor/features/editor-triggers/ensureSubmitTrigger.js";

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

test("ensureSubmitTrigger writes global config under the Nexus user config directory", async () => {
  const previousConfigDir = process.env.NEXUS_CONFIG_DIR;
  const cwd = await mkdtemp(join(tmpdir(), "nexus-trigger-cwd-"));
  const configDir = await mkdtemp(join(tmpdir(), "nexus-trigger-config-"));

  try {
    process.env.NEXUS_CONFIG_DIR = configDir;

    await ensureSubmitTrigger(cwd, "resume");

    const triggerConfig = JSON.parse(await readFile(join(configDir, "editor-triggers.json"), "utf8"));
    assert.deepEqual(triggerConfig, {
      rules: [{ match: { text: "resume", mode: "exact" }, action: { type: "submit" } }],
    });
    await assert.rejects(access(join(cwd, ".nexus", "extensions", "neo-editor", "editor-triggers.json")));
  } finally {
    restoreConfigDirEnv(previousConfigDir);
    await rm(cwd, { recursive: true, force: true });
    await rm(configDir, { recursive: true, force: true });
  }
});
