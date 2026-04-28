import { createServer, type Server } from "node:http";
import { createRequestHandler } from "./create-request-handler.js";
import type { RequestHandlerOptions } from "./create-request-handler.js";

export type StaticServerOptions = RequestHandlerOptions;

/**
 * Creates the local development server for the static landing page.
 *
 * @param options Server filesystem options.
 * @returns Configured HTTP server.
 */
export function createStaticServer(options: StaticServerOptions): Server {
  return createServer(createRequestHandler(options));
}
