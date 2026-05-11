import { expect, test, chromium, type BrowserContext } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const extensionPath = resolve(import.meta.dirname, "..");

/**
 * Starts a real localhost page for content-script E2E coverage.
 *
 * @returns Running server and URL.
 */
async function startPageServer(): Promise<{ server: Server; url: string }> {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html" });
    response.end("<!doctype html><html><body><main><h1>Annotate me</h1><button>Target button</button></main></body></html>");
  });
  await new Promise<void>((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Server did not bind to a TCP port");
  return { server, url: `http://localhost:${address.port}` };
}

/**
 * Opens Chromium with the unpacked extension loaded.
 *
 * @returns Browser context with the extension installed.
 */
async function openExtensionContext(): Promise<BrowserContext> {
  const userDataDir = await mkdtemp(join(tmpdir(), "nexus-chrome-extension-"));
  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
}

test("loads modular content scripts and selects a page element", async () => {
  const { server, url } = await startPageServer();
  const context = await openExtensionContext();
  try {
    const page = await context.newPage();
    await page.goto(url);
    await expect(page.locator("#pi-launcher")).toBeVisible();
    await page.locator("#pi-launcher-toggle").click();
    await expect(page.locator("#pi-panel")).toBeVisible();
    await page.getByRole("heading", { name: "Annotate me" }).click();
    await expect(page.locator(".pi-note-card")).toHaveCount(1);
    await expect(page.locator(".pi-marker-badge")).toHaveText("1");
  } finally {
    await context.close();
    await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
  }
});
