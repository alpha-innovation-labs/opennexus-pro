# Tron agent progress

`Agent` and `SubagentWorkflow` participate in Tron's Nexus transcript rather than bypassing its tool wrapper. Their compact rows retain live activity and completion summaries when collapsed; expansion exposes the detailed result and workflow progress. Rendering changes neither tool execution nor background completion notifications.

## Compact activity

An agent row identifies the agent and task, with a concise running, queued, background, completed, turn-limited, stopped, aborted, or error state drawn from the available tool details. Live activity updates remain visible without expanding the call. Background launch is not presented as completion. A workflow row identifies the run and summarizes its actual progress and lifecycle state, including paused and failed states.

Collapsed successful results retain a compact completion summary instead of disappearing. Optional duration, usage, and model information use available data and existing display preferences; missing data does not become fabricated progress. Errors, including failures before execution supplies structured details, retain their explanatory text.

Live workflow rows own a repaint cadence independent of the optional fleet and agent widgets. The cadence requests Pi tool-row invalidation while a displayed task is running or paused, paints its settled outcome once, and releases its timer on settlement or session shutdown. Live failures show the task's explanatory error in both compact and expanded views; expanded settled rows show the task's actual output rather than its launch receipt.

## Expansion and ownership

Tron owns borders, spacing, grouping, and Nexus styling. The adapter preserves the semantic information from Tintin's call and result renderers without placing an independent upstream tool block beside the Tron transcript. Expanded content retains result details and workflow inspection access; long conversations remain available through [[agent-modals]]. Group collapse does not hide all agent activity behind a generic tool count. `Agent` participates in frame synchronization and assistant tool visibility alongside generic tools and `SubagentWorkflow`, so adjacent calls share border ownership and assistant text/thinking bridges include agent-only groups.

The registration wrapper in `packages/extension-core/runtime/src/registerBundledExtensions.ts`, Tron's `src/compact-tool-lines/createCompactToolDefinition.ts`, and `src/transcript/renderTranscriptEntry.ts` form the integration boundary. Tintin's `src/index.ts` supplies `AgentDetails` and workflow task/card data. Adaptation is limited to presentation: tool names, arguments, results, cancellation, foreground/background execution, and workflow scheduling semantics stay intact. Tron's compact-tool wrapper calls Tintin's call renderer with a theme that reports no background tint, so the tool-shell tint stays Tron's and Tintin's badge does not paint a second row tint. It re-renders Tintin's result renderer on every paint and gives the renderer the component it last produced rather than the Tron border wrapper, so a live background workflow keeps its state across paints. Historical results without live workflow tasks render their stored result text rather than requiring a running task.
