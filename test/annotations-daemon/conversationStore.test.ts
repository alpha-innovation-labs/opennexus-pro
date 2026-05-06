import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { addAnnotation } from "../../packages/mini-apps/src/annotation/core/store/addAnnotation.js";
import { appendAnnotationConversationEvent } from "../../packages/mini-apps/src/annotation/core/conversations/appendAnnotationConversationEvent.js";
import { getAnnotationConversationByUrl } from "../../packages/mini-apps/src/annotation/core/conversations/getAnnotationConversationByUrl.js";
import { upsertAnnotationConversation } from "../../packages/mini-apps/src/annotation/core/conversations/upsertAnnotationConversation.js";

/**
 * Runs a test with an isolated Nexus agent directory.
 *
 * @param fn Test callback.
 */
async function withAgentDir(fn: () => Promise<void>): Promise<void> {
  const agentDir = await mkdtemp(join(tmpdir(), "nexus-annotation-conversation-"));
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

test("annotation submissions on the same URL reuse one conversation", async () => {
  await withAgentDir(async () => {
    const first = await addAnnotation({
      success: true,
      url: "http://localhost:3000/",
      workspaceDir: "/tmp/project-a",
      prompt: "first",
      elements: [],
    });
    const firstConversation = await upsertAnnotationConversation(first.id, first.result);
    const second = await addAnnotation({ success: true, url: "http://localhost:3000/", prompt: "second", elements: [] });
    const secondConversation = await upsertAnnotationConversation(second.id, second.result);

    assert.equal(secondConversation.id, firstConversation.id);
    assert.deepEqual(secondConversation.annotationIds, [first.id, second.id]);
    assert.equal(secondConversation.workspaceDir, "/tmp/project-a");
    assert.equal(secondConversation.events.filter((event) => event.kind === "user").length, 2);
    assert.match(secondConversation.events.at(-1)?.text ?? "", /Follow-up submitted/);

    await appendAnnotationConversationEvent(firstConversation.id, "thinking", "Hello");
    await appendAnnotationConversationEvent(firstConversation.id, "thinking", " world");

    const fetched = await getAnnotationConversationByUrl("http://localhost:3000/");
    assert.equal(fetched?.id, firstConversation.id);
    assert.equal(fetched?.events.at(-1)?.kind, "thinking");
    assert.equal(fetched?.events.at(-1)?.text, "Hello world");
  });
});
