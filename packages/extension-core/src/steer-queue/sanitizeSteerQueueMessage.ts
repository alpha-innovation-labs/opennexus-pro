/**
 * Normalizes steering message text and rejects empty input.
 *
 * @param message Raw steering message text.
 * @returns Trimmed message, or undefined when empty.
 */
export function sanitizeSteerQueueMessage(message: string): string | undefined {
  const trimmed = message.trim();
  return trimmed ? trimmed : undefined;
}
