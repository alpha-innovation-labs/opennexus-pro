import type { RegisteredSlashCommand, SlashMenuLeaf, SlashMenuSection } from "./types.js";
import { createCommandLeaves } from "./createCommandLeaves.js";
import { createDynamicCommandItems } from "./createDynamicCommandItems.js";
import { createThinkingTopLevelItem } from "./createThinkingTopLevelItem.js";
import { createTopLevelPromptCommandLeaves } from "./createTopLevelPromptCommandLeaves.js";
import { groupAndSortTopLevelItems } from "./groupAndSortTopLevelItems.js";

/**
 * Builds top-level slash menu items from registered commands plus settings.
 *
 * @param dynamicCommands Live prompt and skill commands.
 * @returns Top-level slash menu items.
 */
export function createTopLevelItems(dynamicCommands: RegisteredSlashCommand[] = []): Array<SlashMenuLeaf | SlashMenuSection> {
  const commandLeaves = createCommandLeaves();
  const settingsSection: SlashMenuSection = {
    label: "settings",
    description: "Toggle settings and open nested configuration.",
    groupLabel: "Configuration",
    value: "settings",
  };
  return groupAndSortTopLevelItems([
    ...commandLeaves,
    createThinkingTopLevelItem(),
    ...createDynamicCommandItems(dynamicCommands),
    ...createTopLevelPromptCommandLeaves(dynamicCommands),
    settingsSection,
  ]);
}
