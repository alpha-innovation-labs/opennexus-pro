/**
 * Reads the configured Telegram allowlist.
 *
 * @returns Allowed Telegram user ids.
 */
export function readTelegramAllowedUserIds(): Set<string> {
  return new Set(
    (process.env.TELEGRAM_ALLOWED_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}
