import assert from "node:assert/strict";
import test from "node:test";
import { readTelegramAllowedUserIds } from "../../../src/adapters/telegram/config/readTelegramAllowedUserIds.js";

test("readTelegramAllowedUserIds parses a trimmed csv env var", () => {
  const previous = process.env.TELEGRAM_ALLOWED_USER_IDS;
  process.env.TELEGRAM_ALLOWED_USER_IDS = " 1,2 , , 3 ";

  try {
    assert.deepEqual([...readTelegramAllowedUserIds()], ["1", "2", "3"]);
  } finally {
    if (previous === undefined) {
      delete process.env.TELEGRAM_ALLOWED_USER_IDS;
    } else {
      process.env.TELEGRAM_ALLOWED_USER_IDS = previous;
    }
  }
});
