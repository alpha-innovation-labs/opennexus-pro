import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { preloadSkills } from "../../../packages/extensions/src/sub-agents/skill-loader.js";

/**
 * Saves and restores the HOME environment variable for homedir()-based lookups.
 *
 * @param homeDir Replacement HOME value.
 * @returns Cleanup callback.
 */
function withHomeDir(homeDir: string): () => void {
  const previousHome = process.env.HOME;
  process.env.HOME = homeDir;
  return () => {
    if (previousHome === undefined) {
      delete process.env.HOME;
      return;
    }
    process.env.HOME = previousHome;
  };
}

/**
 * Creates a temporary cwd/home sandbox for skill loading.
 *
 * @returns Project cwd and home directory paths.
 */
async function createSkillSandbox(): Promise<{ cwd: string; homeDir: string }> {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-subagents-skills-cwd-"));
  const homeDir = await mkdtemp(join(tmpdir(), "nexus-subagents-skills-home-"));
  return { cwd, homeDir };
}

test("preloadSkills reads .nexus skill files and ignores legacy .pi files", async () => {
  const { cwd, homeDir } = await createSkillSandbox();
  const restoreHome = withHomeDir(homeDir);

  try {
    await mkdir(join(cwd, ".nexus", "skills"), { recursive: true });
    await mkdir(join(homeDir, ".nexus", "skills"), { recursive: true });
    await mkdir(join(cwd, ".pi", "skills"), { recursive: true });

    await writeFile(join(homeDir, ".nexus", "skills", "review.md"), "Global review skill");
    await writeFile(join(cwd, ".nexus", "skills", "review.md"), "Project review skill");
    await writeFile(join(cwd, ".pi", "skills", "legacy.md"), "Legacy skill");

    const skills = preloadSkills(["review", "legacy"], cwd);

    assert.equal(skills[0]?.content, "Project review skill");
    assert.match(skills[1]?.content ?? "", /not found in \.nexus\/skills\//u);
  } finally {
    restoreHome();
  }
});
