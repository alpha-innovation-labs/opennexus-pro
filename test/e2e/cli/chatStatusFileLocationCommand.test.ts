import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";

/**
 * Resolves the expected chat-status path for the isolated e2e environment.
 *
 * @param env Child-process environment.
 * @returns Expected chat-status file path.
 */
function getExpectedChatStatusPath(env: NodeJS.ProcessEnv): string {
  return join(env.NEXUS_CODING_AGENT_DIR ?? "", "chat-status");
}

test("nexus --chat-status-file-location prints the chat-status file path without starting the TUI", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);

  try {
    const result = await runCommand(buildSourceCliCommand(["--chat-status-file-location"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.equal(result.output.trim(), getExpectedChatStatusPath(env));
    assert.doesNotMatch(result.output, /Usage: nexus/u);
    assert.doesNotMatch(result.output, /Working/u);
  } finally {
    await removeReleaseTestHome(homeDir);
  }
});
