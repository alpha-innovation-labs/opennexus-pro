Registers the `/agents` history surface that opens merged run and transcript state in a two-pane modal.

## Usage

```ts
import { registerSubagentCommands } from "../../../../../../src/extensions/sub-agents/ui/registerSubagentCommands.js";

registerSubagentCommands(pi);
```

## Inputs

```ts
type RegisterSubagentCommandsInput = {
  pi: ExtensionAPI; // Receives the command registration callback.
};
```

## Outputs

```ts
type RegisterSubagentCommandsOutput = void;
```

## E2E

| Name | Description |
| --- | --- |
| SubagentHistoryModal | Opens the history modal and keeps the newest transcript lines visible. |
| SubagentHistoryModalNavigation | Supports keyboard movement between the run list and transcript pane. |
| SubagentHistoryModalPaneWidths | Expands the left pane while the run list is focused. |
