const DEFAULT_TELEGRAM_POLL_INTERVAL_MS = 1000;

/**
 * Reads the Telegram polling interval.
 *
 * @returns Poll interval in milliseconds.
 */
export function readTelegramPollIntervalMs(): number {
  const rawValue = process.env.TELEGRAM_POLL_INTERVAL_MS?.trim();
  const parsedValue = rawValue ? Number(rawValue) : DEFAULT_TELEGRAM_POLL_INTERVAL_MS;

  return Number.isFinite(parsedValue) && parsedValue >= 250 ? parsedValue : DEFAULT_TELEGRAM_POLL_INTERVAL_MS;
}
