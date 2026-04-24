Sends one steering message to a running child run or queues it until the child client exists; if the run is already idle or completed, it sends a fresh prompt in the same session. The message is recorded in the same subagent transcript as a user entry.

## Usage

```ts
import { createSteerSubagentTool } from "../../../../../../src/extensions/sub-agents/tooling/createSteerSubagentTool.js";

const tool = createSteerSubagentTool();
await tool.execute("call-3", {
  agent_id: "abcd1234",
  message: "Wrap up with a short summary",
});
```

## Inputs

```ts
type SteerSubagentToolInput = {
  agent_id: string; // Run id from the Agent tool response.
  message: string; // Steering text forwarded to the child client, stored in pendingSteers, or re-prompted into an idle session.
};
```

## Outputs

```ts
type SteerSubagentToolOutput = {
  content: [{
    type: "text";
    text: string; // Always formatted as "Steered subagent <agent_id>" on success.
  }];
};
```

## Errors

```ts
type SteerSubagentToolError = { type: "UnknownSubagentIdError"; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| steerSubagentRun | Appends the steering message to the subagent transcript, queues it before launch, forwards it once the child client is active, and re-prompts completed runs instead of timing out. |
| steer_subagent_unknown_id | Rejects steering for runs that cannot be resolved from memory or disk. |
