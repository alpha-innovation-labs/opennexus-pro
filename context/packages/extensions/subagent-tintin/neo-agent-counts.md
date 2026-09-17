# Neo agent counts

Neo's existing metadata row includes compact running and queued agent counts while either count is nonzero. Counts disappear when no agents are active. This is part of the metadata row, not a restored Pi footer or a separate status row.

## Count ownership

Counts derive from Tintin's top-level agent records, using their running and queued states rather than rendered fleet rows. Workflow containers are not counted as extra agents; hidden nested agents are not added a second time. Fleet visibility, overflow, filtering, and conversation expansion do not change the totals. Finished rows lingering in the fleet do not keep the active count visible.

Lifecycle changes refresh the row when agents start, queue, resume, finish, or stop, including background changes between main-agent turns. Session changes and disposal clear stale counts and subscriptions. Counts remain available even when a user hides the fleet.

## Row composition

The metadata row retains model/provider/thinking badges, session title, TPS, and runtime information. Counts share its width measurement, title truncation, and narrow-terminal clipping rather than creating a second line. Count changes participate in render invalidation and cache identity so the display cannot freeze on a prior count.

`neo-editor/src/features/promptline/status-widget/` owns row rendering; `src/features/promptline/installPromptlineFooter.ts` continues to hide Pi's footer. Tintin's `src/ui/agent-widget.ts` status publication is not treated as a visible footer when Neo is active. [[context/extension/promptline-tps/status-line-layout|Status line layout]] defines the existing row composition, and [[compact-fleet]] defines the fleet placed beneath it.
