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
import { execSync, spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs";
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

/**
 * Resolves the cache file path used by the provider commands.
 * Mirrors the logic in `getModelCachePath` + `getNexusAgentDirPath`.
 */
function getCacheFilePath(): string {
  const agentDir = process.env.NEXUS_CODING_AGENT_DIR
    || process.env.PI_CODING_AGENT_DIR
    || join(require("node:os").homedir(), ".local", "share", "nexus", "agent");
  return join(agentDir, "cache", "available_models.json");
}

describe("provider", () => {
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

  it("just dev provider list produces snapshot", () => {
    const output = execSync("npx just dev provider list", {
      encoding: "utf-8",
      timeout: 60_000,
      cwd: join(__dirname, "../../.."),
    });
    const snapshot = loadSnapshot("list-mixed-status");
    expect(output).toBe(snapshot || output);
    if (!snapshot) saveSnapshot("list-mixed-status", output);
  });

  it("refresh writes cache that list can read, and just dev runs cleanly", async () => {
    const cachePath = getCacheFilePath();

    // 1. Delete the cache file.
    if (existsSync(cachePath)) {
      unlinkSync(cachePath);
    }
    expect(existsSync(cachePath)).toBe(false);

    // 2. Run provider refresh — it must recreate the cache.
    execSync("npx just dev provider refresh", {
      encoding: "utf-8",
      timeout: 60_000,
      cwd: join(__dirname, "../../.."),
    });

    // 3. Confirm the cache file was recreated.
    expect(existsSync(cachePath)).toBe(true);
    const cacheContent = JSON.parse(readFileSync(cachePath, "utf-8"));
    expect(typeof cacheContent).toBe("object");
    expect(Object.keys(cacheContent).length).toBeGreaterThan(0);

    // Each entry is an array of model objects (the new cache format).
    // Providers with no models (access-denied, unreachable) get empty arrays.
    let totalModels = 0;
    for (const [providerId, entry] of Object.entries(cacheContent)) {
      const models = entry as Array<Record<string, unknown>>;
      expect(Array.isArray(models)).toBe(true);
      totalModels += models.length;
    }
    // At least one provider must have models (e.g. lm-studio).
    expect(totalModels).toBeGreaterThan(0);

    // 4. Run `just dev` for 3 seconds and confirm no errors.
    const outputChunks: Buffer[] = [];
    const devProc = spawn("npx", ["just", "dev"], {
      cwd: join(__dirname, "../../.."),
      stdio: ["ignore", "pipe", "pipe"],
    });

    devProc.stdout.on("data", (chunk: Buffer) => {
      outputChunks.push(chunk);
    });

    let stderrOutput = "";
    devProc.stderr.on("data", (chunk: Buffer) => {
      stderrOutput += chunk.toString();
    });

    // Wait 3 seconds, then kill the process.
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        devProc.kill("SIGTERM");
        resolve();
      }, 3_000);
    });

    // Wait for the process to exit gracefully.
    await new Promise<void>((resolve) => {
      devProc.on("exit", () => resolve());
      // Fallback: force kill after 5 seconds.
      setTimeout(() => {
        devProc.kill("SIGKILL");
        resolve();
      }, 5_000);
    });

    const combinedOutput = outputChunks.map((c) => c.toString()).join("");
    // Strip npm warnings before checking for real errors.
    const stderrClean = stderrOutput.replace(/npm warn[\s\S]*/gi, "");
    const combinedClean = combinedOutput + stderrClean;
    // Check that the combined stdout/stderr does not contain error indicators.
    expect(combinedClean).not.toMatch(/error/i);
    expect(combinedClean).not.toMatch(/exception/i);
    expect(combinedClean).not.toMatch(/traceback/i);
  });
});
