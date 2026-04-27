import { join } from "node:path";
import { getGatewayRootPath } from "@nexus/gateway-core/paths/getGatewayRootPath.js";

/**
 * Resolves the Telegram polling offset file path.
 *
 * @returns Absolute Telegram offset path.
 */
export function getTelegramOffsetPath(): string {
  return join(getGatewayRootPath(), "telegram-offset.txt");
}
