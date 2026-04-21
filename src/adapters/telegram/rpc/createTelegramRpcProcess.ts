import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { getNexusCliLaunchSpec } from "../runtime/getNexusCliLaunchSpec.js";
import { getTelegramChatSessionDir } from "../session/getTelegramChatSessionDir.js";
import { getTelegramRpcArgs } from "./getTelegramRpcArgs.js";
import type { TelegramRpcSession } from "./types.js";

/**
 * Starts a persistent Nexus RPC child for one Telegram chat.
 *
 * @param chatId Telegram chat id.
 * @returns Running RPC session state.
 */
export function createTelegramRpcProcess(chatId: number): TelegramRpcSession {
  mkdirSync(getTelegramChatSessionDir(chatId), { recursive: true });

  const { command, args } = getNexusCliLaunchSpec(getTelegramRpcArgs(chatId));
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXUS_DISABLE_BUNDLED_EXTENSIONS: "1",
    },
    stdio: ["pipe", "pipe", "pipe"],
  });

  return {
    child,
    chatId,
    queue: Promise.resolve(),
    stderr: "",
  };
}
