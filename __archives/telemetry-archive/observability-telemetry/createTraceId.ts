import { randomBytes } from "node:crypto";

/**
 * Creates a random OTLP trace id.
 *
 * @returns Lowercase hex trace id.
 */
export function createTraceId(): string {
  return randomBytes(16).toString("hex");
}
