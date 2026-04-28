/**
 * Extracts an owner field from a request body.
 *
 * @param body Parsed request body.
 * @returns Owner identifier.
 */
export function parseOwner(body: unknown): string {
  const owner = typeof body === "object" && body !== null && "owner" in body ? (body as { owner?: unknown }).owner : undefined;
  if (typeof owner !== "string" || owner.trim().length === 0) {
    throw new Error("owner is required");
  }
  return owner.trim();
}
