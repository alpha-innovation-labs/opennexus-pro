# Compact fleet

The default Nexus agent surface is one compact interactive fleet below the editor and below Neo's metadata row. It presents agents and workflows without a competing above-editor widget. Conversation and workflow details remain accessible without expanding the fleet into a second transcript.

## Layout ownership

The visible order is editor, Neo metadata, then fleet. A coordinated layout establishes that order rather than relying on asynchronous widget registration order. Tintin's `src/ui/fleet-list.ts` owns interactive roster behavior. `src/agent-manager.ts` owns the top-level running and queued counts, published by `src/agent-counts.ts`; `src/ui/agent-widget.ts` is the optional legacy above-editor display, not the source of Neo's counts.

`src/ui/below-editor-layout.ts` composes named metadata and fleet slots in one below-editor component. Its state belongs to the TUI instance, so fresh tool UI wrappers and either extension registration order preserve the same layout. Neo reports its rendered editor height, including wrapped input and autocomplete; without Neo, the layout estimates editor height from the current prompt text. Slot cleanup leaves the other surface intact.

Fleet height is bounded by available terminal rows after the editor and metadata receive their space. The fixed twelve-line agent-widget cap is not a guarantee of usable space on a short terminal. The fleet receives at most seven rows after subtracting the measured editor, metadata, and two reserved terminal rows. Resizing or a multiline prompt recomputes the budget; rows are width-clamped. A zero-row budget hides the fleet, and a one-row budget shows only an `/agents` summary.

## Overflow and access

Running and queued work takes priority over lingering finished entries. Hidden entries produce accurate overflow counts, distinguishing agents and workflow runs rather than counting a queued summary as one agent. Navigation keeps the selected entry visible within the height budget. When space only permits a summary, the full roster and inspectors remain available through the agent menu; lack of display space never deletes records or disables actions.

Agent entries with sessions open conversations; queued entries without sessions remain in the roster and explain their state on activation. Workflow entries open the workflow inspector, and the main conversation remains reachable. Finished-entry retention affects visibility only, not result retrieval or completion notifications. [[agent-modals]] defines explicit focus and input ownership; [[neo-agent-counts]] remains the active-count surface even when the fleet is hidden.

## Preference precedence

Defaults apply only to absent preferences: fleet enabled, above-editor widget disabled. Loading or saving unrelated settings does not rewrite explicit `fleetView` or `widgetMode` values. Settings expose the effective surface and explain precedence rather than displaying two apparently active surfaces. Changing fleet visibility refreshes the widget's dormant label in the same settings dialog, preserving the selected setting and pane focus.

An enabled fleet takes precedence as the sole visible fleet surface, including when an explicit legacy `widgetMode` is also present. That legacy value remains stored but dormant while the fleet is enabled. An explicit `fleetView = false` hides the fleet; an explicitly selected `widgetMode = all` or `background` then enables the corresponding legacy above-editor alternative. `widgetMode = off`, or an absent widget preference, leaves that alternative hidden. Disabling the fleet alone does not activate an absent widget preference.

This policy preserves an explicit legacy preference without showing duplicate fleets, and never mistakes the upstream widget default for user consent. Returning to fleet mode requires an explicit user choice when the fleet preference is off. Surface preferences do not disable delegation, workflows, agent menus, or completion notifications.
