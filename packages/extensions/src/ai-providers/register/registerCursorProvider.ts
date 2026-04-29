import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import registerCursorProviderExtension from "pi-cursor-provider";
import { createCursorProviderWithoutFallbackApi } from "./createCursorProviderWithoutFallbackApi.js";

/**
 * Registers the real Cursor provider from pi-cursor-provider.
 *
 * @param pi Pi extension API.
 * @returns A promise that resolves after the Cursor proxy-backed provider is registered.
 */
export async function registerCursorProvider(pi: ExtensionAPI): Promise<void> {
  const startupTasks: Promise<void>[] = [];
  await registerCursorProviderExtension(createCursorProviderWithoutFallbackApi(pi, startupTasks));
  await Promise.all(startupTasks);
}
