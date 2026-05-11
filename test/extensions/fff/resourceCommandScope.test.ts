import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getResourceCommandScope } from "../../../packages/extension-core/src/slash-menu/getResourceCommandScope.js";

test("getResourceCommandScope falls back to source path location", async () => {
  const localPath = join(process.cwd(), ".nexus-test-skill.md");
  const globalDir = await mkdtemp(join(tmpdir(), "nexus-global-skill-"));
  const globalPath = join(globalDir, "SKILL.md");
  await writeFile(localPath, "local", "utf8");
  await writeFile(globalPath, "global", "utf8");

  try {
    assert.equal(getResourceCommandScope({ name: "skill:local", sourceInfo: { path: localPath }, source: "skill" }), "local");
    assert.equal(getResourceCommandScope({ name: "skill:global", sourceInfo: { path: globalPath }, source: "skill" }), "global");
  } finally {
    await rm(localPath, { force: true });
  }
});
