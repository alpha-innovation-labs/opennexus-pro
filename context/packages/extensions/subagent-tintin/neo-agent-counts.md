# Neo agent counts

Neo's existing metadata row includes compact running and queued agent counts while either count is nonzero. Counts disappear when no agents are active. This is part of the metadata row, not a restored Pi footer or a separate status row.

## Count ownership

Counts derive from Tintin's top-level agent records, using their running and queued states rather than rendered fleet rows. Top-level records have neither a `parentAgentId` nor a `workflowId`: nested and workflow-owned children are excluded, and workflow containers are not counted as extra agents. Fleet visibility, overflow, filtering, and conversation expansion do not change the totals. Finished rows lingering in the fleet do not keep the active count visible.

Lifecycle changes refresh the row when agents start, queue, resume, finish, or stop, including background changes between main-agent turns. Session changes and disposal clear stale counts and subscriptions. Counts remain available even when a user hides the fleet.

## State bridge

The agent manager coalesces synchronous lifecycle changes into microtask notifications and supplies immediate snapshots to subscribers. Tintin publishes `{ sessionId, running, queued }` on `subagents:counts`; a matching `subagents:counts:request` obtains the current snapshot regardless of extension startup order. The publisher has no dependency on Neo, Tron, or fleet visibility. Session shutdown detaches the publisher and clears its counts, while manager disposal clears its observers.

Neo subscribes for its UI session, ignores other session IDs, and refreshes the metadata widget when the counts change, even between parent turns. Its subscription is replaced on session start and removed on shutdown. The compact `N running · M queued` label is empty when both counts are zero and joins TPS and runtime in the existing measured right-hand cluster.

## Row composition

The metadata row retains model/provider/thinking badges, session title, TPS, and runtime information. Counts share its width measurement, title truncation, and narrow-terminal clipping rather than creating a second line. Count changes participate in render invalidation and cache identity so the display cannot freeze on a prior count.

`neo-editor/src/features/promptline/status-widget/` owns row rendering; `src/features/promptline/installPromptlineFooter.ts` continues to hide Pi's footer. Tintin's `src/ui/agent-widget.ts` status publication is not treated as a visible footer when Neo is active. [[context/extension/promptline-tps/status-line-layout|Status line layout]] defines the existing row composition, and [[compact-fleet]] defines the fleet placed beneath it.
