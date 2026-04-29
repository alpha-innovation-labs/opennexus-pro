import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { POSTHOG_PROJECT_API_KEY } from "../../packages/observability/src/posthog/constants.js";
import { createPostHogCapturePayload } from "../../packages/observability/src/posthog/createPostHogCapturePayload.js";
import { createPostHogCaptureUrl } from "../../packages/observability/src/posthog/createPostHogCaptureUrl.js";
import { ensurePostHogDistinctId } from "../../packages/observability/src/posthog/ensurePostHogDistinctId.js";
import { sendPostHogEvent } from "../../packages/observability/src/posthog/sendPostHogEvent.js";
import { sendPostHogEventSafely } from "../../packages/observability/src/posthog/sendPostHogEventSafely.js";

const config = {
  apiKey: POSTHOG_PROJECT_API_KEY,
  host: "https://us.i.posthog.com/",
};

test("createPostHogCaptureUrl resolves the capture endpoint", () => {
  assert.equal(createPostHogCaptureUrl(config), "https://us.i.posthog.com/capture/");
});

test("createPostHogCapturePayload uses the public project key and sanitized properties", () => {
  const payload = createPostHogCapturePayload(config, "anon_test", {
    event: "app.start",
    properties: {
      "terminal.term": "xterm-256color",
      bad: undefined,
    },
  });

  assert.equal(payload.api_key, POSTHOG_PROJECT_API_KEY);
  assert.equal(payload.event, "app.start");
  assert.deepEqual(payload.properties, {
    "terminal.term": "xterm-256color",
    distinct_id: "anon_test",
    $lib: "nexus-tui",
  });
});

test("ensurePostHogDistinctId creates and reuses an anonymous id", async () => {
  const dir = await mkdtemp(join(tmpdir(), "nexus-posthog-"));
  const filePath = join(dir, "id");
  const first = await ensurePostHogDistinctId(filePath);
  const second = await ensurePostHogDistinctId(filePath);
  await rm(dir, { recursive: true, force: true });

  assert.match(first, /^anon_/u);
  assert.equal(second, first);
});

test("sendPostHogEvent posts capture payload", async () => {
  let requestBody = "";
  const sent = await sendPostHogEvent("app.start", { "os.platform": "darwin" }, config, async (_input, init) => {
    requestBody = String(init.body);
    return new Response("{}", { status: 200 });
  }, "anon_test");

  assert.equal(sent, true);
  assert.match(requestBody, /app.start/u);
  assert.match(requestBody, /anon_test/u);
});

test("sendPostHogEventSafely maps command usage to a synthetic pageview", async () => {
  const originalFetch = globalThis.fetch;
  const eventNames: string[] = [];
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    eventNames.push(JSON.parse(String(init?.body)).event);
    return new Response("{}", { status: 200 });
  }) as typeof fetch;

  await sendPostHogEventSafely("command.used", { "command.name": "skills" });
  globalThis.fetch = originalFetch;

  assert.deepEqual(eventNames, ["command.used", "$pageview"]);
});
