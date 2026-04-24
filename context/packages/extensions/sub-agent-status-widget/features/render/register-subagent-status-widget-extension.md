Registers the subagent widget, subscribes to shared run changes, and swaps the default working indicator while keeping the widget visible whenever the current chat has subagent history.

## Usage

```ts
import { registerSubagentStatusWidgetExtension } from "../../../../../../src/extensions/sub-agent-status-widget/registerSubagentStatusWidgetExtension.js";

registerSubagentStatusWidgetExtension(pi);
```

## Inputs

```ts
type RegisterSubagentStatusWidgetExtensionInput = {
  pi: ExtensionAPI; // Emits session_start and session_shutdown events.
};
```

## Outputs

```ts
type RegisterSubagentStatusWidgetExtensionOutput = void;
```

## E2E

| Name | Description |
| --- | --- |
| liveToolOutputWidget | Renders one-line live tool output for running subagents and a queued count beneath the editor. |
| createSubagentStatusWidget | Keeps completed subagent history visible and sanitizes multiline tool output. |
| registerSubagentStatusWidgetExtension | Restores the default working indicator and clears the widget on shutdown. |
