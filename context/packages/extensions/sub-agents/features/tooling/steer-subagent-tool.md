Sends one steering message to a running child run or queues it until the child client exists, and records that steering message in the same subagent transcript as a user entry.

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
  message: string; // Steering text forwarded to the child client or stored in pendingSteers.
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
| steerSubagentRun | Appends the steering message to the subagent transcript, queues it before launch, and forwards it once the child client is active. |
| steer_subagent_unknown_id | Rejects steering for runs that cannot be resolved from memory or disk. |
