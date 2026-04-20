import http from "node:http";
import { getWtermDemoPort } from "../config/getWtermDemoPort.js";
import { buildBrowserBundle } from "./buildBrowserBundle.js";
import { createHttpRequestHandler } from "./createHttpRequestHandler.js";
import { createTerminalWebSocketServer } from "./createTerminalWebSocketServer.js";

/**
 * Builds the browser client and starts the local wterm demo server.
 */
export async function startDemoServer(): Promise<void> {
  await buildBrowserBundle();

  const port = getWtermDemoPort();
  const handleRequest = createHttpRequestHandler();
  const server = http.createServer((request, response) => {
    void handleRequest(request, response);
  });
  const terminalServer = createTerminalWebSocketServer(server);

  process.on("SIGINT", () => {
    terminalServer.dispose();
    server.close(() => process.exit(0));
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`wterm demo ready at http://127.0.0.1:${port}`);
  });
}
