import { randomBytes } from "node:crypto";

/**
 * Creates a random OTLP span id.
 *
 * @returns Lowercase hex span id.
 */
export function createSpanId(): string {
  return randomBytes(8).toString("hex");
}
