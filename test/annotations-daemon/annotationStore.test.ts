import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { claimAnnotation } from "../../packages/mini-apps/src/annotation/core/locks/claimAnnotation.js";
import { resolveAnnotation } from "../../packages/mini-apps/src/annotation/core/locks/resolveAnnotation.js";
import { addAnnotation } from "../../packages/mini-apps/src/annotation/core/store/addAnnotation.js";
import { listAnnotations } from "../../packages/mini-apps/src/annotation/core/store/listAnnotations.js";

/**
 * Runs a test with an isolated Nexus agent directory.
 *
 * @param fn Test callback.
 */
async function withAgentDir(fn: () => Promise<void>): Promise<void> {
  const agentDir = await mkdtemp(join(tmpdir(), "nexus-annotations-daemon-"));
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

test("annotations can be added, claimed, and resolved", async () => {
  await withAgentDir(async () => {
    const created = await addAnnotation({
      success: true,
      url: "https://example.com",
      elements: [{
        selector: "#hero",
        location: "main > #hero",
        tag: "section",
        id: "hero",
        classes: ["hero"],
        text: "Hero",
        rect: { x: 0, y: 0, width: 100, height: 50 },
        attributes: {},
        comment: "Fix this",
      }],
    });

    assert.equal((await listAnnotations("pending")).length, 1);

    const claimed = await claimAnnotation(created.id, "chat-a");
    assert.equal(claimed.status, "claimed");
    assert.equal(claimed.claimedBy, "chat-a");
    assert.equal((await listAnnotations("pending")).length, 0);

    await assert.rejects(() => claimAnnotation(created.id, "chat-b"), /already claimed/);

    const resolved = await resolveAnnotation(created.id, "chat-a");
    assert.equal(resolved.status, "resolved");
    assert.equal(resolved.resolvedBy, "chat-a");
  });
});
