import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { runCliWithApp } from "../../../apps/tui/src/cli/runCliWithApp.js";
import { getAnnotationsDaemonLogPath } from "../../../packages/annotations-daemon-core/src/paths/getAnnotationsDaemonLogPath.js";

/**
 * Captures console.log output during a CLI test.
 *
 * @param fn Function that prints through console.log.
 * @returns Captured output text.
 */
async function captureConsoleLog(fn: () => Promise<void>): Promise<string> {
  const originalConsoleLog = console.log;
  const output: string[] = [];
  console.log = (line?: unknown) => output.push(String(line ?? ""));
  try {
    await fn();
    return output.join("\n");
  } finally {
    console.log = originalConsoleLog;
  }
}

/**
 * Runs a test with an isolated Nexus agent directory.
 *
 * @param fn Test callback.
 */
async function withAgentDir(fn: () => Promise<void>): Promise<void> {
  const agentDir = await mkdtemp(join(tmpdir(), "nexus-annotation-cli-"));
  const previousAgentDir = process.env.NEXUS_CODING_AGENT_DIR;
  process.env.NEXUS_CODING_AGENT_DIR = agentDir;
  try {
    await fn();
  } finally {
    if (previousAgentDir === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = previousAgentDir;
    await rm(agentDir, { recursive: true, force: true });
  }
}

test("nexus annotation status reports the stopped daemon", async () => {
  await withAgentDir(async () => {
    let ranApp = false;
    let exitCode = -1;
    const output = await captureConsoleLog(async () => {
      exitCode = await runCliWithApp(["annotation", "status"], {
        async runApp() {
          ranApp = true;
        },
      });
    });

    assert.equal(exitCode, 0);
    assert.equal(ranApp, false);
    assert.match(output, /annotation daemon stopped/);
  });
});

test("nexus annotation logs prints path and recent daemon log lines", async () => {
  await withAgentDir(async () => {
    const logPath = getAnnotationsDaemonLogPath();
    await mkdir(dirname(logPath), { recursive: true });
    await writeFile(logPath, "line one\nline two\n", "utf8");
    const output = await captureConsoleLog(async () => {
      await runCliWithApp(["annotation", "logs"], { async runApp() {} });
    });

    assert.match(output, /annotation daemon log:/);
    assert.match(output, /line one/);
    assert.match(output, /line two/);
  });
});
