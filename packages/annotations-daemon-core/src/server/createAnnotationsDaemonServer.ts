import { createServer, type Server } from "node:http";
import { handleRequest } from "./handleRequest.js";

/**
 * Creates the annotations daemon HTTP server.
 *
 * @returns Configured HTTP server.
 */
export function createAnnotationsDaemonServer(): Server {
  return createServer((request, response) => {
    void handleRequest(request, response);
  });
}
