import type { IncomingMessage } from "node:http";

/**
 * Reads and parses a request JSON body.
 *
 * @param request Incoming HTTP request.
 * @returns Parsed JSON body.
 */
export async function readRequestJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}
