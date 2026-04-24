Reads one tracked or persisted run and can wait for queued work to reach a terminal state.

## Usage

```ts
import { createGetSubagentResultTool } from "../../../../../../src/extensions/sub-agents/tooling/createGetSubagentResultTool.js";

const tool = createGetSubagentResultTool();
await tool.execute("call-2", {
  agent_id: "abcd1234",
  wait: true,
});
```

## Inputs

```ts
type GetSubagentResultToolInput = {
  agent_id: string; // Run id from the Agent tool response.
  wait?: boolean; // Waits for the live client or persisted snapshot to reach a terminal status.
};
```

## Outputs

```ts
type GetSubagentResultToolOutput = {
  content: [{
    type: "text";
    text: string; // Unknown ids return "Unknown subagent id: <id>"; known ids return formatSubagentResult output.
  }];
};
```

## Errors

```ts
type GetSubagentResultToolError =
  | { type: "SubagentWaitTimeoutError"; message: string }
  | { type: "SubagentRunDisappearedError"; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| waitForSubagentCompletion | Waits on a queued run until the persisted status becomes terminal. |
| get_subagent_result_unknown_id | Returns a stable text response when the requested run id does not exist. |
