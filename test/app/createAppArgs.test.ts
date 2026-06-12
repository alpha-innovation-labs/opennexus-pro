import assert from "node:assert/strict";
import test from "node:test";
import { getBundledCommandsPath } from "../../packages/assets/src/commands/getBundledCommandsPath.js";
import { createAppArgs } from "../../apps/tui/src/cli/createAppArgs.js";
import { baseSystemPrompt } from "../../packages/assets/src/prompts/base-system-prompt/baseSystemPrompt.js";
import { getBundledThemesPath } from "../../packages/assets/src/themes/getBundledThemesPath.js";

test("createAppArgs prepends bundled themes, bundled commands, and the base system prompt", () => {
  assert.deepEqual(createAppArgs(["--help"]), [
    "--theme",
    getBundledThemesPath(),
    "--prompt-template",
    getBundledCommandsPath(),
    "--append-system-prompt",
    baseSystemPrompt,
    "--help",
  ]);
});

test("createAppArgs preserves an explicit --no-extensions opt-out", () => {
  assert.deepEqual(createAppArgs(["--no-extensions", "--help"]), [
    "--theme",
    getBundledThemesPath(),
    "--prompt-template",
    getBundledCommandsPath(),
    "--append-system-prompt",
    baseSystemPrompt,
    "--no-extensions",
    "--help",
  ]);
});

test("createAppArgs preserves the short no-extensions opt-out", () => {
  assert.deepEqual(createAppArgs(["-ne", "--help"]), [
    "--theme",
    getBundledThemesPath(),
    "--prompt-template",
    getBundledCommandsPath(),
    "--append-system-prompt",
    baseSystemPrompt,
    "-ne",
    "--help",
  ]);
});

test("createAppArgs avoids duplicating the bundled themes path", () => {
  assert.deepEqual(
    createAppArgs(["--theme", getBundledThemesPath(), "--no-extensions", "--help"]),
    [
      "--prompt-template",
      getBundledCommandsPath(),
      "--append-system-prompt",
      baseSystemPrompt,
      "--theme",
      getBundledThemesPath(),
      "--no-extensions",
      "--help",
    ],
  );
});

test("createAppArgs avoids duplicating the bundled prompt-template path", () => {
  assert.deepEqual(
    createAppArgs(["--prompt-template", getBundledCommandsPath(), "--no-extensions", "--help"]),
    [
      "--theme",
      getBundledThemesPath(),
      "--append-system-prompt",
      baseSystemPrompt,
      "--prompt-template",
      getBundledCommandsPath(),
      "--no-extensions",
      "--help",
    ],
  );
});

test("createAppArgs avoids duplicating the bundled base system prompt", () => {
  assert.deepEqual(
    createAppArgs(["--append-system-prompt", baseSystemPrompt, "--no-extensions", "--help"]),
    [
      "--theme",
      getBundledThemesPath(),
      "--prompt-template",
      getBundledCommandsPath(),
      "--append-system-prompt",
      baseSystemPrompt,
      "--no-extensions",
      "--help",
    ],
  );
});

test("getBundledThemesPath resolves the themes directory in source mode", () => {
  assert.match(getBundledThemesPath(), /\/src\/themes\/?$/);
});

test("getBundledCommandsPath resolves the commands directory in source mode", () => {
  assert.match(getBundledCommandsPath(), /\/src\/commands\/?$/);
});

/* ── user commands tests ───────────────────────────────────────────── */

test("createAppArgs injects user commands path before bundled when directory exists", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getUserCommandsPath } = await import("../../packages/nexus-runtime/src/config/getUserCommandsPath.js");

  const configDir = join(tmpdir(), `nexus-test-${Date.now()}`);
  const commandsDir = join(configDir, "commands");
  mkdirSync(commandsDir, { recursive: true });
  writeFileSync(join(commandsDir, "_placeholder.md"), "---\ndescription: placeholder\n---\n");

  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);
    const userCommandsPath = getUserCommandsPath();

    const promptTemplateFlags: { index: number; path: string }[] = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push({ index: i, path: args[i + 1] });
      }
    }

    assert.equal(promptTemplateFlags.length, 2, "should have exactly two --prompt-template flags");

    const userEntry = promptTemplateFlags.find((e) => e.path === userCommandsPath);
    const bundledEntry = promptTemplateFlags.find((e) => e.path !== userCommandsPath);

    assert.ok(userEntry, "user --prompt-template should be present");
    assert.ok(bundledEntry, "bundled --prompt-template should be present");
    assert.ok(
      userEntry.index < bundledEntry.index,
      "user commands path should appear before bundled path",
    );
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
  }
});

test("createAppArgs does not inject user commands when directory is missing", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getUserCommandsPath } = await import("../../packages/nexus-runtime/src/config/getUserCommandsPath.js");

  const configDir = join(tmpdir(), `nexus-test-no-cmd-${Date.now()}`);
  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);
    const userCommandsPath = getUserCommandsPath();

    const promptTemplateFlags = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push(args[i + 1]);
      }
    }

    assert.equal(promptTemplateFlags.length, 1, "should have exactly one --prompt-template");
    assert.notEqual(promptTemplateFlags[0], userCommandsPath);
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
  }
});

test("createAppArgs skips user commands when --no-prompt-templates is passed", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getUserCommandsPath } = await import("../../packages/nexus-runtime/src/config/getUserCommandsPath.js");

  const configDir = join(tmpdir(), `nexus-test-np-${Date.now()}`);
  const commandsDir = join(configDir, "commands");
  mkdirSync(commandsDir, { recursive: true });
  writeFileSync(join(commandsDir, "_placeholder.md"), "---\ndescription: placeholder\n---\n");

  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs(["--no-prompt-templates"]);
    const userCommandsPath = getUserCommandsPath();

    const promptTemplateFlags = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push(args[i + 1]);
      }
    }

    assert.equal(promptTemplateFlags.length, 1, "should have exactly one --prompt-template (bundled only)");
    assert.notEqual(promptTemplateFlags[0], userCommandsPath);
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
  }
});
