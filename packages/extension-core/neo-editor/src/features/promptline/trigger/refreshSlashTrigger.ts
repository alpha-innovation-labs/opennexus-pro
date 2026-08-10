import type { SlashMenuModal } from "@extensions/slash-menu/SlashMenuModal";

/**
 * Refreshes the slash modal query from the active prefix.
 *
 * @param modal Slash modal.
 * @param prefix Active slash prefix.
 */
export async function refreshSlashTrigger(modal: SlashMenuModal, prefix: string): Promise<void> {
  modal.setQuery(prefix.startsWith("/") ? prefix.slice(1) : prefix);
  await modal.refresh();
}
