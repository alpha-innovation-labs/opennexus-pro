import { randomUUID } from "node:crypto";

/**
 * Creates a response identifier for stored fetched content.
 *
 * @returns Unique response id for the current process.
 */
export function createResponseId(): string {
  return `fetch_${randomUUID()}`;
}
