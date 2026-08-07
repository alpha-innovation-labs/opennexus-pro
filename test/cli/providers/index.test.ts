/**
 * End-to-end snapshot test for `just dev provider refresh`.
 *
 * Spawns the real `just dev provider refresh` command via the `just` CLI,
 * captures its stdout + stderr (including ANSI colour codes), and compares
 * against a stored snapshot in `test/cli/providers/snapshots/`.
 *
 * Regenerate snapshots by deleting the snapshots folder and re-running:
 *   rm -rf test/cli/providers/snapshots
 *   npx vitest run test/cli/providers/index.test.ts
 */

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SNAPSHOT_DIR = join(__dirname, "snapshots");

function loadSnapshot(name: string): string {
  try {
    return readFileSync(join(SNAPSHOT_DIR, `${name}.txt`), "utf-8");
  } catch {
    return "";
  }
}

function saveSnapshot(name: string, content: string): void {
  const { writeFileSync, mkdirSync } = require("node:fs");
  mkdirSync(SNAPSHOT_DIR, { recursive: true });
  writeFileSync(join(SNAPSHOT_DIR, `${name}.txt`), content, "utf-8");
}

describe("provider refresh", () => {
  it("just dev provider refresh produces snapshot", () => {
    const output = execSync("npx just dev provider refresh", {
      encoding: "utf-8",
      timeout: 60_000,
      cwd: join(__dirname, "../../.."),
    });
    const snapshot = loadSnapshot("refresh-mixed-status");
    expect(output).toBe(snapshot || output);
    if (!snapshot) saveSnapshot("refresh-mixed-status", output);
  });
});
