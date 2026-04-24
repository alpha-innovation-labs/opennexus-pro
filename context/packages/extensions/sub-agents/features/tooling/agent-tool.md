Spawns one RPC child run and returns either a background id or the formatted foreground result.

## Usage

```ts
import { createAgentTool } from "../../../../../../src/extensions/sub-agents/tooling/createAgentTool.js";

const tool = createAgentTool();
await tool.execute(
  "call-1",
  {
    prompt: "Scan the subagent extension wiring",
    description: "Inspect subagent wiring",
    subagent_type: "Explore",
    run_in_background: true,
    inherit_context: true,
    context_providers: ["parent-conversation", "project-context"],
  },
  undefined,
  undefined,
  ctx,
);
```

## Inputs

```ts
type AgentToolInput = {
  prompt: string;
  description: string;
  subagent_type: string;
  model?: string;
  thinking?: string;
  max_turns?: number; // Accepted by the tool surface but not enforced by the current RPC runtime.
  run_in_background?: boolean;
  inherit_context?: boolean; // When true, the runtime defaults to parent-conversation + project-context unless context_providers is set.
  isolated?: boolean; // Accepted by the tool surface; the current RPC client already launches children with --no-extensions.
  context_providers?: string[]; // Ordered provider ids that override inherit_context defaults.
};
```

## Outputs

```ts
type AgentToolOutput = {
  content: [{
    type: "text";
    text: string; // Background runs return a started message; foreground runs return formatSubagentResult output.
  }];
};
```

## Errors

```ts
type AgentToolError =
  | { type: "ContextProviderResolutionError"; message: string }
  | { type: "RpcClientLaunchError"; message: string }
  | { type: "ForegroundRunError"; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| liveToolOutputWidget | Starts a background run and surfaces its live tool output through the async agents widget. |
| agent_tool_foreground_run | Runs a foreground child to idle and returns the formatted result text to the parent. |
