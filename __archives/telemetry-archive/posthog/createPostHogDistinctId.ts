import { randomUUID } from "node:crypto";

/**
 * Creates an anonymous PostHog distinct id.
 *
 * @returns Anonymous distinct id.
 */
export function createPostHogDistinctId(): string {
  return `anon_${randomUUID()}`;
}
