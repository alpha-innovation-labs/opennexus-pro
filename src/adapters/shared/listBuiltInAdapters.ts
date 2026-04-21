import type { AdapterDefinition } from "./types.js";
import { createDiscordAdapterDefinition } from "../discord/index.js";
import { createTelegramAdapterDefinition } from "../telegram/index.js";

/**
 * Lists the adapters bundled with Nexus.
 *
 * @returns Built-in adapter definitions.
 */
export function listBuiltInAdapters(): AdapterDefinition[] {
  return [createTelegramAdapterDefinition(), createDiscordAdapterDefinition()];
}
