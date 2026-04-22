import assert from "node:assert/strict";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { createNexusCliSessionFixture } from "./createNexusCliSessionFixture.js";

test("npm run dev forwards direct --resume targets into the source CLI", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const { sessionId } = await createNexusCliSessionFixture(homeDir);

  try {
    const result = await runCommand(`npm run dev -- --resume ${sessionId}`, {
      cwd: process.cwd(),
      env,
      timeoutMs: 8_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.match(result.output, /CLI resume fixture/);
    assert.match(result.output, /CLI resume assistant/);
  } finally {
    await removeReleaseTestHome(homeDir);
  }
});
