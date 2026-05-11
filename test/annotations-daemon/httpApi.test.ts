import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createAnnotationsDaemonServer } from "../../packages/mini-apps/src/annotation/core/server/createAnnotationsDaemonServer.js";

/**
 * Starts a test daemon server on a random local port.
 *
 * @returns Base URL and cleanup function.
 */
async function startTestServer(): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server = createAnnotationsDaemonServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.equal(typeof address, "object");
  assert.ok(address);
  const port = (address as AddressInfo).port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

/**
 * Runs a test with an isolated agent directory.
 *
 * @param fn Test callback.
 */
async function withAgentDir(fn: () => Promise<void>): Promise<void> {
  const agentDir = await mkdtemp(join(tmpdir(), "nexus-annotations-api-"));
  const previousAgentDir = process.env.NEXUS_CODING_AGENT_DIR;
  const previousDisableAgent = process.env.NEXUS_ANNOTATION_DISABLE_AGENT;
  process.env.NEXUS_CODING_AGENT_DIR = agentDir;
  process.env.NEXUS_ANNOTATION_DISABLE_AGENT = "1";
  try {
    await fn();
  } finally {
    if (previousAgentDir === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = previousAgentDir;
    if (previousDisableAgent === undefined) delete process.env.NEXUS_ANNOTATION_DISABLE_AGENT;
    else process.env.NEXUS_ANNOTATION_DISABLE_AGENT = previousDisableAgent;
    await rm(agentDir, { recursive: true, force: true });
  }
}

test("annotations daemon HTTP API stores, lists, claims, and resolves annotations", async () => {
  await withAgentDir(async () => {
    const server = await startTestServer();
    try {
      const createResponse = await fetch(`${server.baseUrl}/annotations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ success: true, url: "https://example.com", workspaceDir: "/tmp/project-a", elements: [] }),
      });
      assert.equal(createResponse.status, 201);
      const created = await createResponse.json() as { annotation: { id: string }, conversation: { id: string, workspaceDir: string } };

      const conversationResponse = await fetch(`${server.baseUrl}/annotation-conversation?url=${encodeURIComponent("https://example.com")}`);
      const conversationBody = await conversationResponse.json() as { conversation: { id: string, annotationIds: string[] } };
      assert.equal(conversationBody.conversation.id, created.conversation.id);
      assert.equal(created.conversation.workspaceDir, "/tmp/project-a");
      assert.deepEqual(conversationBody.conversation.annotationIds, [created.annotation.id]);

      const listResponse = await fetch(`${server.baseUrl}/annotations?status=pending`);
      const listed = await listResponse.json() as { annotations: unknown[] };
      assert.equal(listed.annotations.length, 1);

      const claimResponse = await fetch(`${server.baseUrl}/annotations/${created.annotation.id}/claim`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ owner: "chat-a" }),
      });
      assert.equal(claimResponse.status, 200);

      const steerResponse = await fetch(`${server.baseUrl}/annotation-conversations/${created.conversation.id}/steer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "wait for my next note" }),
      });
      assert.equal(steerResponse.status, 202);

      const stopResponse = await fetch(`${server.baseUrl}/annotation-conversations/${created.conversation.id}/stop`, { method: "POST" });
      assert.equal(stopResponse.status, 202);

      const resolveResponse = await fetch(`${server.baseUrl}/annotations/${created.annotation.id}/resolve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ owner: "chat-a" }),
      });
      assert.equal(resolveResponse.status, 200);
    } finally {
      await server.close();
    }
  });
});
