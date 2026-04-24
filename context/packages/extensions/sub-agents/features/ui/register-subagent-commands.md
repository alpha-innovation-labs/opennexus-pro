Registers the `/agents` history surface that opens the current parent cwd/session runs in a two-pane modal.

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
| showSubagentHistoryModal | Loads only the current parent cwd/session scope before opening the history modal. |
| SubagentHistoryModal | Opens the history modal and keeps the newest transcript lines visible within the current parent scope. |
| SubagentHistoryModalNavigation | Supports keyboard movement between the run list and transcript pane. |
| SubagentHistoryModalPaneWidths | Expands the left pane while the run list is focused. |
