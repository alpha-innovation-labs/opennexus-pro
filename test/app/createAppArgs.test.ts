import assert from "node:assert/strict";
import test from "node:test";
import { getBundledCommandsPath } from "../../packages/assets/src/commands/getBundledCommandsPath.js";
import { createAppArgs } from "../../apps/tui/src/cli/createAppArgs.js";
import { baseSystemPrompt } from "../../packages/assets/src/prompts/base-system-prompt/baseSystemPrompt.js";
import { getBundledThemesPath } from "../../packages/assets/src/themes/getBundledThemesPath.js";

test("createAppArgs prepends bundled themes, bundled commands, and the base system prompt", async () => {
  const { getAgentCommandsPath, agentCommandsExists } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const args = createAppArgs(["--help"]);
  const bundledCommandsPath = getBundledCommandsPath();
  const agentCommandsPath = getAgentCommandsPath();
  const promptTemplateFlags: { index: number; path: string }[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--prompt-template") {
      promptTemplateFlags.push({ index: i, path: args[i + 1] });
    }
  }
  assert.ok(
    promptTemplateFlags.some((e) => e.path === bundledCommandsPath),
    "bundled --prompt-template should be present",
  );
  const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);
  const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
  if (agentEntry && bundledEntry) {
    assert.ok(agentEntry.index < bundledEntry.index, "agent commands before bundled");
  }
  assert.ok(args.includes("--append-system-prompt"), "base system prompt should be present");
  assert.ok(args.includes("--theme"), "theme flag should be present");
});

test("createAppArgs preserves an explicit --no-extensions opt-out", async () => {
  const { getAgentCommandsPath, agentCommandsExists } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const args = createAppArgs(["--no-extensions", "--help"]);
  const bundledCommandsPath = getBundledCommandsPath();
  const agentCommandsPath = getAgentCommandsPath();
  const promptTemplateFlags: { index: number; path: string }[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--prompt-template") {
      promptTemplateFlags.push({ index: i, path: args[i + 1] });
    }
  }
  assert.ok(args.includes("--no-extensions"), "--no-extensions should be preserved");
  assert.ok(args.includes("--help"), "--help should be preserved");
  assert.ok(
    promptTemplateFlags.some((e) => e.path === bundledCommandsPath),
    "bundled --prompt-template should be present",
  );
  const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);
  const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
  if (agentEntry && bundledEntry) {
    assert.ok(agentEntry.index < bundledEntry.index, "agent commands before bundled");
  }
});

test("createAppArgs preserves the short no-extensions opt-out", async () => {
  const { getAgentCommandsPath, agentCommandsExists } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const args = createAppArgs(["-ne", "--help"]);
  const bundledCommandsPath = getBundledCommandsPath();
  const agentCommandsPath = getAgentCommandsPath();
  const promptTemplateFlags: { index: number; path: string }[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--prompt-template") {
      promptTemplateFlags.push({ index: i, path: args[i + 1] });
    }
  }
  assert.ok(args.includes("-ne"), "-ne should be preserved");
  assert.ok(args.includes("--help"), "--help should be preserved");
  assert.ok(
    promptTemplateFlags.some((e) => e.path === bundledCommandsPath),
    "bundled --prompt-template should be present",
  );
  const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);
  const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
  if (agentEntry && bundledEntry) {
    assert.ok(agentEntry.index < bundledEntry.index, "agent commands before bundled");
  }
});

test("createAppArgs avoids duplicating the bundled themes path", async () => {
  const { getAgentCommandsPath, agentCommandsExists } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const args = createAppArgs(["--theme", getBundledThemesPath(), "--no-extensions", "--help"]);
  const bundledCommandsPath = getBundledCommandsPath();
  const agentCommandsPath = getAgentCommandsPath();
  const bundledThemesPath = getBundledThemesPath();
  const promptTemplateFlags: { index: number; path: string }[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--prompt-template") {
      promptTemplateFlags.push({ index: i, path: args[i + 1] });
    }
  }
  const themeIdx = args.indexOf("--theme");
  assert.ok(args[themeIdx + 1] === bundledThemesPath, "theme flag should use bundled path");
  assert.ok(
    promptTemplateFlags.some((e) => e.path === bundledCommandsPath),
    "bundled --prompt-template should be present",
  );
  const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);
  const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
  if (agentEntry && bundledEntry) {
    assert.ok(agentEntry.index < bundledEntry.index, "agent commands before bundled");
  }
});

test("createAppArgs avoids duplicating the bundled prompt-template path", async () => {
  const { getAgentCommandsPath, agentCommandsExists } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const args = createAppArgs(["--prompt-template", getBundledCommandsPath(), "--no-extensions", "--help"]);
  const bundledCommandsPath = getBundledCommandsPath();
  const agentCommandsPath = getAgentCommandsPath();
  const promptTemplateFlags: { index: number; path: string }[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--prompt-template") {
      promptTemplateFlags.push({ index: i, path: args[i + 1] });
    }
  }
  assert.ok(args.includes("--no-extensions"), "--no-extensions should be preserved");
  const bundledCount = promptTemplateFlags.filter((e) => e.path === bundledCommandsPath).length;
  assert.ok(bundledCount <= 1, "bundled --prompt-template should not be duplicated");
  const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
  const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);
  if (agentEntry && bundledEntry) {
    assert.ok(agentEntry.index < bundledEntry.index, "agent commands before bundled");
  }
});

test("createAppArgs avoids duplicating the bundled base system prompt", async () => {
  const { getAgentCommandsPath, agentCommandsExists } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const args = createAppArgs(["--append-system-prompt", baseSystemPrompt, "--no-extensions", "--help"]);
  const bundledCommandsPath = getBundledCommandsPath();
  const agentCommandsPath = getAgentCommandsPath();
  const promptTemplateFlags: { index: number; path: string }[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--prompt-template") {
      promptTemplateFlags.push({ index: i, path: args[i + 1] });
    }
  }
  assert.ok(args.includes("--no-extensions"), "--no-extensions should be preserved");
  const systemPromptCount = args.filter((a) => a === baseSystemPrompt).length;
  assert.ok(systemPromptCount <= 1, "base system prompt should not be duplicated");
  assert.ok(
    promptTemplateFlags.some((e) => e.path === bundledCommandsPath),
    "bundled --prompt-template should be present",
  );
  const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);
  const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
  if (agentEntry && bundledEntry) {
    assert.ok(agentEntry.index < bundledEntry.index, "agent commands before bundled");
  }
});

test("getBundledThemesPath resolves the themes directory in source mode", () => {
  const themesPath = getBundledThemesPath();
  if (themesPath.includes("/src/")) {
    assert.match(themesPath, /\/src\/themes\/?$/);
  }
});

test("getBundledCommandsPath resolves the commands directory in source mode", () => {
  const commandsPath = getBundledCommandsPath();
  if (commandsPath.includes("/src/")) {
    assert.match(commandsPath, /\/src\/commands\/?$/);
  }
});

/* ── user commands tests ───────────────────────────────────────────── */

test("createAppArgs injects user commands path before bundled when directory exists", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getUserCommandsPath } = await import("../../packages/nexus-runtime/src/config/getUserCommandsPath.js");
  const { getAgentCommandsPath } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const { getBundledCommandsPath } = await import("../../packages/assets/src/commands/getBundledCommandsPath.js");

  const configDir = join(tmpdir(), `nexus-test-${Date.now()}`);
  const commandsDir = join(configDir, "commands");
  mkdirSync(commandsDir, { recursive: true });
  writeFileSync(join(commandsDir, "_placeholder.md"), "---\ndescription: placeholder\n---\n");

  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);
    const userCommandsPath = getUserCommandsPath();
    const agentCommandsPath = getAgentCommandsPath();
    const bundledCommandsPath = getBundledCommandsPath();

    const promptTemplateFlags: { index: number; path: string }[] = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push({ index: i, path: args[i + 1] });
      }
    }

    assert.ok(
      promptTemplateFlags.some((e) => e.path === userCommandsPath),
      "user --prompt-template should be present",
    );
    assert.ok(
      promptTemplateFlags.some((e) => e.path === bundledCommandsPath),
      "bundled --prompt-template should be present",
    );

    const userEntry = promptTemplateFlags.find((e) => e.path === userCommandsPath);
    const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);
    assert.ok(
      userEntry.index < bundledEntry.index,
      "user commands path should appear before bundled path",
    );

    const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
    if (agentEntry) {
      assert.ok(
        userEntry.index < agentEntry.index,
        "user commands should appear before agent commands",
      );
      assert.ok(
        agentEntry.index < bundledEntry.index,
        "agent commands should appear before bundled",
      );
    }
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
  }
});

test("createAppArgs does not inject user commands when directory is missing", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getUserCommandsPath } = await import("../../packages/nexus-runtime/src/config/getUserCommandsPath.js");
  const { getBundledCommandsPath } = await import("../../packages/assets/src/commands/getBundledCommandsPath.js");

  const configDir = join(tmpdir(), `nexus-test-no-cmd-${Date.now()}`);
  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);
    const userCommandsPath = getUserCommandsPath();
    const bundledCommandsPath = getBundledCommandsPath();

    const promptTemplateFlags = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push(args[i + 1]);
      }
    }

    assert.ok(
      promptTemplateFlags.length >= 1,
      "should have at least one --prompt-template (bundled)",
    );
    assert.ok(
      promptTemplateFlags.includes(bundledCommandsPath),
      "bundled --prompt-template should be present",
    );
    assert.ok(
      !promptTemplateFlags.includes(userCommandsPath),
      "user --prompt-template should not be present when directory is missing",
    );
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
  }
});

test("createAppArgs skips user and agent commands when --no-prompt-templates is passed", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getUserCommandsPath } = await import("../../packages/nexus-runtime/src/config/getUserCommandsPath.js");
  const { getAgentCommandsPath } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const { getBundledCommandsPath } = await import("../../packages/assets/src/commands/getBundledCommandsPath.js");

  const configDir = join(tmpdir(), `nexus-test-np-${Date.now()}`);
  const commandsDir = join(configDir, "commands");
  mkdirSync(commandsDir, { recursive: true });
  writeFileSync(join(commandsDir, "_placeholder.md"), "---\ndescription: placeholder\n---\n");

  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs(["--no-prompt-templates"]);
    const userCommandsPath = getUserCommandsPath();
    const agentCommandsPath = getAgentCommandsPath();
    const bundledCommandsPath = getBundledCommandsPath();

    const promptTemplateFlags = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push(args[i + 1]);
      }
    }

    assert.ok(
      promptTemplateFlags.length === 1,
      "should have exactly one --prompt-template (bundled only)",
    );
    assert.equal(promptTemplateFlags[0], bundledCommandsPath);
    assert.notEqual(promptTemplateFlags[0], userCommandsPath);
    assert.notEqual(promptTemplateFlags[0], agentCommandsPath);
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
  }
});

/* ── agent commands tests ──────────────────────────────────────────────── */

test("createAppArgs injects agent commands between user and bundled", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeFileSync, mkdirSync, rmSync } = await import("node:fs");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getUserCommandsPath } = await import("../../packages/nexus-runtime/src/config/getUserCommandsPath.js");
  const { getAgentCommandsPath } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const { getBundledCommandsPath } = await import("../../packages/assets/src/commands/getBundledCommandsPath.js");
  const { getAgentDirPath } = await import("../../packages/nexus-runtime/src/config/getAgentDirPath.js");

  const configDir = join(tmpdir(), `nexus-test-${Date.now()}`);
  const userCommandsDir = join(configDir, "commands");
  mkdirSync(userCommandsDir, { recursive: true });
  writeFileSync(join(userCommandsDir, "_placeholder.md"), "---\ndescription: placeholder\n---\n");

  const agentCommandsDir = join(getAgentDirPath(), "commands");
  mkdirSync(agentCommandsDir, { recursive: true });
  writeFileSync(join(agentCommandsDir, "_placeholder.md"), "---\ndescription: placeholder\n---\n");

  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);
    const userCommandsPath = getUserCommandsPath();
    const agentCommandsPath = getAgentCommandsPath();
    const bundledCommandsPath = getBundledCommandsPath();

    const promptTemplateFlags: { index: number; path: string }[] = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push({ index: i, path: args[i + 1] });
      }
    }

    assert.equal(promptTemplateFlags.length, 3, "should have exactly three --prompt-template flags");

    const userEntry = promptTemplateFlags.find((e) => e.path === userCommandsPath);
    const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
    const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);

    assert.ok(userEntry, "user --prompt-template should be present");
    assert.ok(agentEntry, "agent --prompt-template should be present");
    assert.ok(bundledEntry, "bundled --prompt-template should be present");
    assert.ok(
      userEntry.index < agentEntry.index,
      "user commands should appear before agent commands",
    );
    assert.ok(
      agentEntry.index < bundledEntry.index,
      "agent commands should appear before bundled",
    );
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
    rmSync(agentCommandsDir, { recursive: true, force: true });
  }
});

test("createAppArgs injects agent commands when user commands directory is missing", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeFileSync, mkdirSync, rmSync } = await import("node:fs");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getAgentCommandsPath } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const { getBundledCommandsPath } = await import("../../packages/assets/src/commands/getBundledCommandsPath.js");
  const { getAgentDirPath } = await import("../../packages/nexus-runtime/src/config/getAgentDirPath.js");

  const configDir = join(tmpdir(), `nexus-test-no-user-${Date.now()}`);

  const agentCommandsDir = join(getAgentDirPath(), "commands");
  mkdirSync(agentCommandsDir, { recursive: true });
  writeFileSync(join(agentCommandsDir, "_placeholder.md"), "---\ndescription: placeholder\n---\n");

  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);
    const agentCommandsPath = getAgentCommandsPath();
    const bundledCommandsPath = getBundledCommandsPath();

    const promptTemplateFlags: { index: number; path: string }[] = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push({ index: i, path: args[i + 1] });
      }
    }

    assert.equal(promptTemplateFlags.length, 2, "should have exactly two --prompt-template flags");

    const agentEntry = promptTemplateFlags.find((e) => e.path === agentCommandsPath);
    const bundledEntry = promptTemplateFlags.find((e) => e.path === bundledCommandsPath);

    assert.ok(agentEntry, "agent --prompt-template should be present");
    assert.ok(bundledEntry, "bundled --prompt-template should be present");
    assert.ok(
      agentEntry.index < bundledEntry.index,
      "agent commands should appear before bundled",
    );
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
    rmSync(agentCommandsDir, { recursive: true, force: true });
  }
});

test("createAppArgs skips agent commands when --no-prompt-templates is passed", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeFileSync, mkdirSync, rmSync } = await import("node:fs");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getAgentCommandsPath } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const { getBundledCommandsPath } = await import("../../packages/assets/src/commands/getBundledCommandsPath.js");
  const { getAgentDirPath } = await import("../../packages/nexus-runtime/src/config/getAgentDirPath.js");

  const configDir = join(tmpdir(), `nexus-test-agent-np-${Date.now()}`);

  const agentCommandsDir = join(getAgentDirPath(), "commands");
  mkdirSync(agentCommandsDir, { recursive: true });
  writeFileSync(join(agentCommandsDir, "_placeholder.md"), "---\ndescription: placeholder\n---\n");

  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs(["--no-prompt-templates"]);
    const agentCommandsPath = getAgentCommandsPath();
    const bundledCommandsPath = getBundledCommandsPath();

    const promptTemplateFlags = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push(args[i + 1]);
      }
    }

    assert.equal(promptTemplateFlags.length, 1, "should have exactly one --prompt-template (bundled only)");
    assert.equal(promptTemplateFlags[0], bundledCommandsPath);
    assert.notEqual(promptTemplateFlags[0], agentCommandsPath);
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
    rmSync(agentCommandsDir, { recursive: true, force: true });
  }
});

test("createAppArgs works when agent commands directory is missing", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { writeFileSync, mkdirSync, rmSync } = await import("node:fs");
  const { createAppArgs } = await import("../../apps/tui/src/cli/createAppArgs.js");
  const { getAgentCommandsPath } = await import("../../packages/nexus-runtime/src/config/getAgentCommandsPath.js");
  const { getBundledCommandsPath } = await import("../../packages/assets/src/commands/getBundledCommandsPath.js");
  const { getAgentDirPath } = await import("../../packages/nexus-runtime/src/config/getAgentDirPath.js");

  const configDir = join(tmpdir(), `nexus-test-agent-no-cmd-${Date.now()}`);

  const agentCommandsDir = join(getAgentDirPath(), "commands");
  // Ensure agent commands dir does NOT exist
  rmSync(agentCommandsDir, { recursive: true, force: true });

  const originalEnv = process.env.NEXUS_CONFIG_DIR;
  try {
    process.env.NEXUS_CONFIG_DIR = configDir;
    const args = createAppArgs([]);
    const agentCommandsPath = getAgentCommandsPath();
    const bundledCommandsPath = getBundledCommandsPath();

    const promptTemplateFlags = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--prompt-template") {
        promptTemplateFlags.push(args[i + 1]);
      }
    }

    assert.equal(promptTemplateFlags.length, 1, "should have exactly one --prompt-template (bundled only)");
    assert.equal(promptTemplateFlags[0], bundledCommandsPath);
    assert.notEqual(promptTemplateFlags[0], agentCommandsPath);
  } finally {
    process.env.NEXUS_CONFIG_DIR = originalEnv;
  }
});
