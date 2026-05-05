const TELEGRAM_STATUS_EDIT_INTERVAL_MS = 1200;

export interface TelegramStatusEditorOptions {
  intervalMs?: number;
  now?: () => number;
}

/**
 * Creates a throttled Telegram status editor.
 *
 * @param chatId Target Telegram chat id.
 * @param messageId Telegram status message id.
 * @param editMessage Performs the Telegram edit.
 * @param options Testable timing overrides.
 * @returns Throttled update function.
 */
export function createTelegramStatusEditor(
  chatId: number,
  messageId: number,
  editMessage: (chatId: number, messageId: number, text: string) => Promise<void>,
  options: TelegramStatusEditorOptions = {},
): (text: string) => Promise<void> {
  const intervalMs = options.intervalMs ?? TELEGRAM_STATUS_EDIT_INTERVAL_MS;
  const now = options.now ?? Date.now;
  let lastText = "";
  let lastEditAt = 0;
  let nextAllowedEditAt = 0;
  let pendingText = "";
  let timer: ReturnType<typeof setTimeout> | undefined;
  let flushPromise: Promise<void> | undefined;

  const clearTimer = (): void => {
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timer = undefined;
  };

  const scheduleFlush = (): void => {
    clearTimer();
    const waitMs = Math.max(0, Math.max(lastEditAt + intervalMs, nextAllowedEditAt) - now());
    timer = setTimeout(() => {
      timer = undefined;
      void flush();
    }, waitMs);
  };

  const flush = async (): Promise<void> => {
    if (!pendingText || flushPromise) {
      return flushPromise;
    }

    const text = pendingText;
    const waitUntil = Math.max(lastEditAt + intervalMs, nextAllowedEditAt);
    if (now() < waitUntil) {
      scheduleFlush();
      return;
    }

    flushPromise = (async () => {
      try {
        await editMessage(chatId, messageId, text);
        lastText = text;
        lastEditAt = now();
        nextAllowedEditAt = lastEditAt;
        if (pendingText === text) {
          pendingText = "";
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("message is not modified")) {
          lastText = text;
          lastEditAt = now();
          nextAllowedEditAt = lastEditAt;
          if (pendingText === text) {
            pendingText = "";
          }
          return;
        }

        const retryAfterMatch = message.match(/retry after\s+(\d+)/i);
        if (retryAfterMatch) {
          nextAllowedEditAt = now() + Number(retryAfterMatch[1]) * 1000;
          scheduleFlush();
          return;
        }

        console.error("[gateway:telegram:status-edit]", {
          chatId,
          messageId,
          message,
        });
      } finally {
        flushPromise = undefined;
        if (pendingText && pendingText !== lastText) {
          scheduleFlush();
        }
      }
    })();

    return flushPromise;
  };

  return async (text: string): Promise<void> => {
    if (!text || text === lastText || text === pendingText) {
      return;
    }

    pendingText = text;
    await flush();
  };
}
