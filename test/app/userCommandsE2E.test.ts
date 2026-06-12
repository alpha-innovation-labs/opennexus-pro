import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { createAppArgs } from "../../apps/tui/src/cli/createAppArgs.js";
import { getUserCommandsPath } from "../../packages/nexus-runtime/src/config/getUserCommandsPath.js";

/**
 * E2E test: user commands directory is registered and injected into CLI args.
 *
 * This test creates a temporary `~/.config/nexus/commands/` directory,
 * writes a `ping.md` command, and verifies that `createAppArgs` produces
 * the expected `--prompt-template` flags with user commands listed before
 * bundled commands (so user commands shadow bundled ones).
 */
test("user commands directory is registered and user commands shadow bundled", async () => {
  const configDir = join(tmpdir(), `nexus-e2e-${Date.now()}`);
  const commandsDir = join(configDir, "commands");
  const originalEnv = process.env.NEXUS_CONFIG_DIR;

  try {
    mkdirSync(commandsDir, { recursive: true });
    writeFileSync(
      join(commandsDir, "ping.md"),
      [
        '---',
        'description: Pick a random number between 1 and 10',
        '---',
        "",
        "# Nexus Ping",
        "",
        "When the user types `/ping` with optional arguments:",
        "1. Parse any numeric arguments (default: 1 to 10).",
        "2. Pick a random number in that range.",
        "3. Reply with just the number, nothing else.",
        "",
        "Example user input: `/ping`",
        "Expected output: A single number between 1 and 10.",
        "",
        "Example user input: `/ping 1 100`",
        "Expected output: A single number between 1 and 100.",
      ].join("\n"),
    );

    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);

    const promptTemplateFlags = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push(args[i + 1]);
      }
    }

    const userCommandsPath = getUserCommandsPath();

    assert.equal(promptTemplateFlags.length, 2, "should have exactly two --prompt-template flags");
    assert.equal(promptTemplateFlags[0], userCommandsPath, "first --prompt-template should be user commands");
    assert.notEqual(promptTemplateFlags[1], userCommandsPath, "second --prompt-template should be bundled");
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
    rmSync(configDir, { recursive: true, force: true });
  }
});

/**
 * Negative test: non-existent user commands directory is silently skipped.
 */
test("createAppArgs works without a user commands directory", async () => {
  const configDir = join(tmpdir(), `nexus-e2e-no-cmd-${Date.now()}`);
  const originalEnv = process.env.NEXUS_CONFIG_DIR;

  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);

    const promptTemplateFlags = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push(args[i + 1]);
      }
    }

    assert.equal(promptTemplateFlags.length, 1, "should have exactly one --prompt-template (bundled only)");
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
  }
});
