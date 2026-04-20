import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { listTestFiles } from "../../../scripts/testing/files/listTestFiles.mjs";

test("listTestFiles excludes release executable tests by default", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "nexus-test-files-"));

  try {
    await mkdir(join(projectRoot, "test", "app"), { recursive: true });
    await mkdir(join(projectRoot, "test", "e2e", "release-executable"), { recursive: true });
    await writeFile(join(projectRoot, "test", "app", "alpha.test.ts"), "");
    await writeFile(join(projectRoot, "test", "e2e", "release-executable", "beta.test.ts"), "");
    await writeFile(join(projectRoot, "test", "app", "gamma.ts"), "");

    const testFiles = await listTestFiles(projectRoot, "without-release");

    assert.deepEqual(testFiles, ["test/app/alpha.test.ts"]);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("listTestFiles includes release executable tests for the release mode", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "nexus-test-files-"));

  try {
    await mkdir(join(projectRoot, "test", "app"), { recursive: true });
    await mkdir(join(projectRoot, "test", "e2e", "release-executable"), { recursive: true });
    await writeFile(join(projectRoot, "test", "app", "alpha.test.ts"), "");
    await writeFile(join(projectRoot, "test", "e2e", "release-executable", "beta.test.ts"), "");

    const testFiles = await listTestFiles(projectRoot, "with-release");

    assert.deepEqual(testFiles, ["test/app/alpha.test.ts", "test/e2e/release-executable/beta.test.ts"]);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});
