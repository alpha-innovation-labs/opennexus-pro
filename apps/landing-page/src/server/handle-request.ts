import { createReadStream, existsSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { renderPage } from "../app/render-page.js";
import { getContentType } from "./get-content-type.js";
import { resolveAssetPath } from "./resolve-asset-path.js";

export type HandleRequestOptions = {
  readonly publicDir: string;
  readonly stylesDir: string;
};

/**
 * Handles one HTTP request for the landing page development server.
 *
 * @param options Static asset options for request handling.
 * @param request Incoming HTTP request.
 * @param response Outgoing HTTP response.
 * @returns Nothing after writing a response or piping an asset.
 */
export function handleRequest(
  options: HandleRequestOptions,
  request: IncomingMessage,
  response: ServerResponse
): void {
  if (!request.url || request.url === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(renderPage());
    return;
  }

  const assetPath = resolveAssetPath(options, request.url);
  if (!assetPath || !existsSync(assetPath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "content-type": getContentType(assetPath) });
  createReadStream(assetPath).pipe(response);
}
