# Why an internal tracker

The TPS engine is a port of the pi-token-speed package's measurement core, kept inside neo-editor. Depending on the package instead is rejected, and stays rejected.

## What the package is

pi-token-speed is a self-contained pi extension. It renders its own status-bar entry through its own renderer, owns a settings schema (`tokenSpeed` in the agent settings file), ships an interactive `/tps` settings menu, and layers per-provider overrides, TTFT, color tiers, and icon configuration on top of the sliding-window measurement. The measurement core — sliding window, span clamp, pause handling, end-of-stream average — is a small, self-contained part of that package.

## Why not depend on it

- **Two status-bar entries.** The package renders into the pi status bar; neo-editor's reading belongs inside its own promptline status line, where it must obey that line's width, truncation, and render cache. A second entry would sit beside the promptline, double-report the same stream, and drift out of the promptline's layout rules.
- **A settings surface neo-editor does not want.** The compact `N ⚡ M` label has no configuration. Taking the package takes its schema, its validation warnings, and its menu along with it.
- **Coupling to a third-party extension.** Its event handling, its version constraints on the pi SDK, and its release cadence would all sit under neo-editor's status line.

The core that neo-editor needs is the arithmetic — both of which the package documents and tests. Porting that core is the whole feature; everything else in the package is display and configuration that belongs to the package's own surface.

## What the port keeps

The port keeps the package's algorithm, not its behavior details: the 1000 ms window, the 100 ms span floor, and the independent live/average snapshots at stream end. For display it adopts a reduced subset of the package's presentation — the bolt icon and the speed-based color tiers on the separator — rendered as a single always-present two-value label in the promptline. What it drops is everything else tied to the package's own surface: TTFT, display modes, per-provider overrides, the settings schema and `/tps` menu, the update-interval throttle (replaced by the fixed refresh cadence in [[event-wiring]]), and the per-delta token count (replaced by an estimate from delta text length).
