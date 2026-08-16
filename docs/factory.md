What I Did

Built a new nexus factory CLI command from scratch with two subcommands:

nexus factory list — Lists available workflow factories from .factory/ (user-created) and examples/
(template) directories. Creates .factory/ automatically on first run.

nexus factory explain — Prints a comprehensive guide on how to create factories, covering workflow
YAML structure, control blocks (loop_until / parallel), step types (bash / agent), and output
passing via <previous-output>.

5 new files in apps/tui/src/cli/factory/:
- hasFactoryFlag.ts — detects nexus factory in argv
- parseFactoryArgs.ts — parses subcommand args
- runFactoryCommand.ts — dispatches to subcommands
- runFactoryList.ts — lists factories from .factory/ + examples/
- runFactoryExplain.ts — prints the creation guide

2 existing files modified:
- runCliWithApp.ts — wired in the factory routing
- createNexusUsageText.ts — added nexus factory to the help menu

────────────────────────────────────────────────────────────────────────────────

What I Learned

1. CLI routing is a flat if chain — runCliWithApp.ts checks each command flag in order. New commands
get a hasXxxFlag(argv) guard and a call to the handler, placed before the options.runApp(argv)
fallback.

2. The MiniAppManifest pattern exists but isn't used for built-in commands. Built-in commands
(install, subagent, themes, etc.) use the simpler hasFlag + runCommand pattern directly in
runCliWithApp.

3. TypeScript discriminated unions are unforgiving — grouping "list" | "explain" | "help" in a
single case block makes subcommand a union type, which the compiler won't assign back to the
narrow member types. Solution: separate each case explicitly.

4. Commands follow a directory-per-command convention — each CLI command gets its own folder under
apps/tui/src/cli/ with a hasXxxFlag.ts + runXxxCommand.ts pair, plus any subcommand handlers.

5. The examples folder is the template source — examples/dev.yaml, examples/agora.yaml, and
examples/workflow-template.md serve as the reference factories that factory list surfaces.
