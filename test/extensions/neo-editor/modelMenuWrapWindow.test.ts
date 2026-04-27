import assert from "node:assert/strict";
import test from "node:test";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { renderSelectListLines } from "../../../packages/tui-kit/src/modal/select/renderSelectListLines.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates one grouped autocomplete item for select-list rendering tests.
 */
function createGroupedItem(provider: string, value: string): AutocompleteItem {
  return {
    value,
    label: `• ${value}`,
    groupLabel: provider,
  } as AutocompleteItem;
}

test("select list keeps wrapped bottom selection visible with preceding provider rows", () => {
  const lines = renderSelectListLines({
    items: [
      createGroupedItem("openai", "gpt-5"),
      createGroupedItem("openai", "gpt-5-mini"),
      createGroupedItem("openai", "gpt-5-nano"),
      createGroupedItem("xai", "grok-code-fast"),
      createGroupedItem("zai", "glm-coding-plan"),
    ],
    maxVisible: 5,
    selectedIndex: 4,
    theme: createTestTheme(),
    width: 40,
  });

  assert.equal(lines.length, 5);
  assert.match(lines.join("\n"), /gpt-5-nano/);
  assert.match(lines.join("\n"), /glm-coding-plan/);
});
