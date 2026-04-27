import type { IncomingMessage, ServerResponse } from "node:http";
import { createWtermHtmlDocument } from "../html/createWtermHtmlDocument.js";
import { readBundleAsset } from "./readBundleAsset.js";

/**
 * Creates the HTTP handler that serves the browser-hosted shell and assets.
 */
export function createHttpRequestHandler(): (
  request: IncomingMessage,
  response: ServerResponse,
) => Promise<void> {
  return async (request: IncomingMessage, response: ServerResponse) => {
    if (request.url === "/client.js") {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      response.end(await readBundleAsset("index.js"));
      return;
    }

    if (request.url === "/client.css") {
      response.writeHead(200, { "content-type": "text/css; charset=utf-8" });
      response.end(await readBundleAsset("index.css"));
      return;
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(createWtermHtmlDocument());
  };
}
