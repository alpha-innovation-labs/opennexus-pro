import { MAX_RESPONSE_SIZE } from "./constants.js";

/**
 * Reads a response body while enforcing the maximum response size.
 *
 * @param response Fetch response to read.
 * @returns Response body as an ArrayBuffer.
 */
export async function readResponseArrayBuffer(response: Response): Promise<ArrayBuffer> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
    throw new Error("Response too large (exceeds 5MB limit)");
  }
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE) {
    throw new Error("Response too large (exceeds 5MB limit)");
  }
  return arrayBuffer;
}
