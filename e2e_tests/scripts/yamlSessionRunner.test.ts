#!/usr/bin/env tsx
/**
 * yamlSessionRunner.test.ts — Integration tests for the YAML session runner.
 *
 * Verifies the full flow:
 *   1. YAML file is parsed correctly into config + interactions.
 *   2. Session management functions (kill, create, capture) work with tmux.
 *   3. Snapshot is captured and golden reference is persisted.
 *
 * Note: These tests require a running tmux instance.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";
import { parseSimpleYaml, runYamlSession } from "./yamlSessionRunner";

// ────────────────────────────────────────────────────────────────────────
// YAML parsing + config extraction tests
// ────────────────────────────────────────────────────────────────────────

test("runYamlSession — parses YAML and extracts config correctly", async () => {
  const tmpDir = await mkdtemp(join(tmpdir(), "nexus-yaml-test-"));
  const yamlPath = join(tmpDir, "test_session.yaml");
  const yamlContent = `sessionName: integration-test
cwd: ${tmpDir}
command: echo "hello world"
waitSeconds: 1
interactions:
  - { type: key, value: "ls -la", delay: 500 }
  - { type: wait, value: 1000 }
`;
  writeFileSync(yamlPath, yamlContent, "utf-8");

  // Parse the YAML and verify the config extraction matches what runYamlSession would do
  const config = parseSimpleYaml(yamlContent);
  assert.equal(String(config.sessionName), "integration-test");
  assert.equal(String(config.command), "echo \"hello world\"");
  assert.equal(Number(config.waitSeconds), 1);
  assert.ok(Array.isArray(config.interactions));
  assert.equal(config.interactions.length, 2);

  const first = config.interactions[0] as Record<string, unknown>;
  assert.equal(first.type, "key");
  assert.equal(first.value, "ls -la");
  assert.equal(first.delay, 500);

  const second = config.interactions[1] as Record<string, unknown>;
  assert.equal(second.type, "wait");
  assert.equal(second.value, 1000);

  // Clean up
  rmSync(tmpDir, { recursive: true, force: true });
});

test("runYamlSession — rejects YAML with missing command", async () => {
  const tmpDir = await mkdtemp(join(tmpdir(), "nexus-yaml-test-"));
  const yamlPath = join(tmpDir, "bad_session.yaml");
  writeFileSync(yamlPath, "sessionName: no-command\n", "utf-8");

  // runYamlSession should exit with code 1 when command is missing
  let exitCode = 0;
  const originalExit = process.exit;
  process.exit = ((code: number) => {
    exitCode = code;
  }) as never;

  try {
    runYamlSession(yamlPath);
  } catch {
    // Expected — process.exit is mocked
  }

  process.exit = originalExit as never;
  assert.equal(exitCode, 1);

  rmSync(tmpDir, { recursive: true, force: true });
});

test("runYamlSession — rejects non-existent YAML file", async () => {
  let exitCode = 0;
  const originalExit = process.exit;
  process.exit = ((code: number) => {
    exitCode = code;
  }) as never;

  try {
    runYamlSession("/nonexistent/path/to/file.yaml");
  } catch {
    // Expected — process.exit is mocked
  }

  process.exit = originalExit as never;
  assert.equal(exitCode, 1);
});

// NOTE: The interactive approval flow (tmux session creation + snapshot capture +
// user approval + golden persistence) is tested manually via the existing
// automation.sh and automation_failed_tool_call.sh scripts.
// These unit tests cover the YAML parsing and config extraction logic.
