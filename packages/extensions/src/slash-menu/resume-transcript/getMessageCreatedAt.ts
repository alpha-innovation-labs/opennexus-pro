/**
 * Resolves one persisted session message timestamp into epoch milliseconds.
 *
 * @param message Session message.
 * @returns Unix timestamp in milliseconds.
 */
export function getMessageCreatedAt(message: { timestamp?: unknown }): number {
  if (typeof message.timestamp === "number" && Number.isFinite(message.timestamp)) {
    return message.timestamp;
  }
  if (typeof message.timestamp === "string") {
    const parsed = new Date(message.timestamp).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}
