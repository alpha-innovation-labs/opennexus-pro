# Architecture

High-level system structure and invariants for this mission.

---

The repository exposes developer commands through the root `justfile`, which imports command-specific recipes from `justfiles/`. The `dev` recipe currently sets development environment context and forwards arguments into `npm run dev`, which launches the source Nexus CLI through `tsx -- src/index.ts`.

The new command behavior is a CLI fast path at the command/recipe boundary: exact ping/pong responses should complete without starting the Nexus/Pi TUI. Normal `just dev` launch behavior and non-ping argument forwarding remain compatibility invariants.

Output exactness is part of the architecture for these smoke commands: no npm script banner, TUI startup text, help output, stderr, or ANSI/TUI framing may appear in the ping/pong paths.
