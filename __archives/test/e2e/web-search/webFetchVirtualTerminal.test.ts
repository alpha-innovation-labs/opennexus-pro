import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import test from "node:test";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { registerWebSearchExtension } from "../../../packages/extension-core/src/web-search/registerWebSearchExtension.js";

/**
 * Starts a deterministic local HTTP server for web_fetch coverage.
 *
 * @returns Server and base URL.
 */
async function startFixtureServer(): Promise<{ server: Server; baseUrl: string }> {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end("<html><head><script>hidden()</script></head><body><h1>Nexus Web Fetch</h1><p>Local &amp; fixture content.</p></body></html>");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

/**
 * Creates an ExtensionAPI capture object for registered tools.
 *
 * @returns Captured tool registrations and API object.
 */
function createToolCapture(): { api: unknown; tools: Map<string, { execute: (...args: any[]) => Promise<any> }> } {
  const tools = new Map<string, { execute: (...args: any[]) => Promise<any> }>();
  return {
    tools,
    api: {
      registerTool(tool: { name: string; execute: (...args: any[]) => Promise<any> }) {
        tools.set(tool.name, tool);
      },
      appendEntry() {},
    },
  };
}

test("web_fetch renders fetched markdown in the virtual terminal", async () => {
  const { server, baseUrl } = await startFixtureServer();
  try {
    const { api, tools } = createToolCapture();
    registerWebSearchExtension(api as never);

    assert.deepEqual([...tools.keys()], ["web_fetch", "code_search", "fetch_content", "get_search_content"]);
    const result = await tools.get("web_fetch")?.execute("call-1", { url: baseUrl, format: "markdown" }, undefined);
    const text = result.content.find((item: { type: string }) => item.type === "text")?.text ?? "";
    const viewport = await renderComponentInVirtualTerminal(() => new LinesComponent(() => text.split("\n")), 80, 10);
    const output = viewport.join("\n");

    assert.match(output, /Nexus Web Fetch/u);
    assert.match(output, /Local & fixture content/u);
    const textResult = await tools.get("web_fetch")?.execute("call-2", { url: baseUrl, format: "text" }, undefined);
    const plainText = textResult.content.find((item: { type: string }) => item.type === "text")?.text ?? "";
    assert.match(plainText, /Nexus Web Fetch\s*Local & fixture content/u);
    assert.doesNotMatch(plainText, /hidden/u);
    assert.doesNotMatch([...tools.keys()].join(","), /web_search/u);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
