import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runCli } from "../../src/cli/runCli.js";

const packageVersion = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")).version;

test("runCli prints the Nexus package version for --version", async () => {
  const originalConsoleLog = console.log;
  const printedLines: string[] = [];

  console.log = (value?: unknown) => {
    printedLines.push(String(value ?? ""));
  };

  try {
    const exitCode = await runCli(["--version"]);

    assert.equal(exitCode, 0);
    assert.equal(printedLines[0], packageVersion);
  } finally {
    console.log = originalConsoleLog;
  }
});

test("runCli prints the Nexus package version for -v", async () => {
  const originalConsoleLog = console.log;
  const printedLines: string[] = [];

  console.log = (value?: unknown) => {
    printedLines.push(String(value ?? ""));
  };

  try {
    const exitCode = await runCli(["-v"]);

    assert.equal(exitCode, 0);
    assert.equal(printedLines[0], packageVersion);
  } finally {
    console.log = originalConsoleLog;
  }
});
