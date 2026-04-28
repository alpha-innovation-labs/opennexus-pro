import type { RequestListener } from "node:http";
import { handleRequest, type HandleRequestOptions } from "./handle-request.js";

export type RequestHandlerOptions = HandleRequestOptions;

/**
 * Creates a request handler that serves the landing page and public assets.
 *
 * @param options Static asset options for the request handler.
 * @returns HTTP request handler for Node's server.
 */
export function createRequestHandler(options: RequestHandlerOptions): RequestListener {
  return handleRequest.bind(null, options);
}
