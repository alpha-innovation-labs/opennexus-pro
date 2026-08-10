import type { RegisteredSlashCommand, SlashMenuLeaf, SlashMenuSection } from "./types";
import { createCommandLeaves } from "./createCommandLeaves";
import { createDynamicCommandItems } from "./createDynamicCommandItems";
import { createThinkingTopLevelItem } from "./createThinkingTopLevelItem";
import { createToolsTopLevelItem } from "./createToolsTopLevelItem";
import { createTopLevelPromptCommandLeaves } from "./createTopLevelPromptCommandLeaves";
import { groupAndSortTopLevelItems } from "./groupAndSortTopLevelItems";

/**
 * Builds top-level slash menu items from registered commands plus settings.
 *
 * @param dynamicCommands Live prompt and skill commands.
 * @returns Top-level slash menu items.
 */
export function createTopLevelItems(dynamicCommands: RegisteredSlashCommand[] = []): Array<SlashMenuLeaf | SlashMenuSection> {
  const commandLeaves = createCommandLeaves(dynamicCommands);
  const toolsSection = createToolsTopLevelItem();
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
    toolsSection,
    ...createTopLevelPromptCommandLeaves(dynamicCommands),
    settingsSection,
  ]);
}
