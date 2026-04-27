import http from "node:http";
import { getWtermE2ePort } from "../config/getWtermE2ePort.js";
import { buildBrowserBundle } from "./buildBrowserBundle.js";
import { createHttpRequestHandler } from "./createHttpRequestHandler.js";
import { createTerminalWebSocketServer } from "./createTerminalWebSocketServer.js";

/**
 * Builds the browser client and starts the local wterm e2e server.
 */
export async function startE2eServer(): Promise<void> {
  await buildBrowserBundle();

  const port = getWtermE2ePort();
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
    console.log(`wterm e2e ready at http://127.0.0.1:${port}`);
  });
}
