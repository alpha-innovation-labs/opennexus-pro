import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { logoutProvider } from "../../model/logoutProvider.ts";

/**
 * Logs out a provider. Returns the notification message.
 */
export async function logoutSelectedProvider(
  ctx: ExtensionContext,
  providerId: string,
): Promise<string> {
  await logoutProvider(ctx, providerId);
  return `Logged out of ${providerId}`;
}
