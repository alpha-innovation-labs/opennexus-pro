import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Executes one isolated tsx eval command inside the repository.
 *
 * @param script Inline module source.
 * @param env Additional environment variables.
 * @returns Parsed JSON result from stdout.
 */
async function runIsolatedEval(script: string, env: Record<string, string>): Promise<unknown> {
  const tsxPath = resolve("node_modules", ".bin", "tsx");
  const { stdout } = await execFileAsync(tsxPath, ["--eval", script], {
    cwd: resolve("."),
    env: {
      ...process.env,
      ...env,
    },
  });

  return JSON.parse(stdout.trim());
}

test("runtime patch reads project settings from .nexus and falls back to nexus-black", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "nexus-config-patch-"));
  const projectDir = join(rootDir, "project");
  const fallbackDir = join(rootDir, "fallback");
  const agentDir = join(rootDir, "agent");

  await mkdir(join(projectDir, ".nexus"), { recursive: true });
  await mkdir(join(projectDir, ".pi"), { recursive: true });
  await mkdir(agentDir, { recursive: true });
  await writeFile(join(projectDir, ".nexus", "settings.json"), '{"theme":"light"}\n', "utf8");
  await writeFile(join(projectDir, ".pi", "settings.json"), '{"theme":"dark"}\n', "utf8");

  const output = await runIsolatedEval(
    [
      'import { applyNexusConfigPatch } from "./src/runtime/config/applyNexusConfigPatch.ts";',
      '(async () => {',
      '  await applyNexusConfigPatch();',
      '  const { SettingsManager } = await import("./node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js");',
      '  const projectSettings = SettingsManager.create(process.env.TEST_PROJECT_DIR, process.env.TEST_AGENT_DIR);',
      '  const fallbackSettings = SettingsManager.create(process.env.TEST_FALLBACK_DIR, process.env.TEST_AGENT_DIR);',
      '  console.log(JSON.stringify({ projectTheme: projectSettings.getTheme(), fallbackTheme: fallbackSettings.getTheme() }));',
      '})().catch((error) => {',
      '  console.error(error);',
      '  process.exit(1);',
      '});',
    ].join("\n"),
    {
      TEST_PROJECT_DIR: projectDir,
      TEST_FALLBACK_DIR: fallbackDir,
      TEST_AGENT_DIR: agentDir,
      PI_CODING_AGENT_DIR: agentDir,
      NEXUS_CODING_AGENT_DIR: agentDir,
    },
  ) as { projectTheme: string; fallbackTheme: string };

  assert.deepEqual(output, {
    projectTheme: "light",
    fallbackTheme: "nexus-black",
  });
});
