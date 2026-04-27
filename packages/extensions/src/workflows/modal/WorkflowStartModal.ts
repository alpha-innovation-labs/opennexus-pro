import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import type { WorkflowDefinition } from "../state/types.js";

/**
 * Modal for selecting an available workflow to start.
 */
export class WorkflowStartModal extends SelectPreviewModal {
  constructor(
    theme: ExtensionCommandContext["ui"]["theme"],
    definitions: WorkflowDefinition[],
    done: (result: WorkflowDefinition | null) => void,
  ) {
    const byId = new Map(definitions.map((definition) => [definition.id, definition]));
    const items: AutocompleteItem[] = definitions.map((definition) => ({
      value: definition.id,
      label: definition.name,
      description: definition.description,
    }));
    super(theme, (item) => done(byId.get(item.value) ?? null), () => done(null), undefined, {
      leftTitle: "Workflows",
      rightTitle: "Description",
      leftPaneRatio: 0.35,
    });
    this.setOnSelectionChange((item) => {
      const definition = item ? byId.get(item.value) : undefined;
      this.setRightLines(definition ? [definition.description, "", "Enter starts this workflow.", "Esc cancels."] : ["No workflow selected"]);
    });
    this.setItems(items);
  }
}
