# Coding Workflow

This document describes the default workflow for delivering a feature or bug fix using dedicated agents, project context, worktrees, beads tasks, and human review.

## Agents

1. **Librarian**
   - Owns project context under `./context/`.
   - Reads authoritative rules from `./context/.rules`.
   - Must not edit `./context/.rules`; those files are user-owned.
   - Discovers relevant project context and references for the requested work.
   - Grills the user with clarification questions until the user approves that discovery is final.
   - Produces the context brief that the Engineer receives before implementation.
   - Uses the Q&A transcript to update project context when appropriate.
   - Performs the final context update after human feedback has been resolved.

2. **Engineer**
   - Implements the requested feature or bug fix from the Librarian context brief and project references.
   - Writes tests according to the plan.
   - Does not ask the user clarification questions directly.
   - Makes reasonable implementation assumptions when blocked and reports those assumptions for the human-in-the-loop review step.

3. **E2E Engineer**
   - Runs project-required e2e tests.
   - Fixes failures by steering implementation back through the engineering step until the required e2e checks pass.
   - Must not guess the e2e harness. The required harness must be specified by project context rules.

4. **QA Engineer**
   - Independently reviews code quality.
   - Looks for hacks, shortcuts, quick fixes, hidden coupling, weak tests, and maintainability issues by reading the code and surrounding project patterns.

## Workflow

1. User asks to work on a new feature or bug fix.
2. Generate an epic title and task ID.
3. Create a worktree for the task under `~/.worktrees/<project>/<branch-or-name>`.
4. Librarian discovers relevant context and references.
5. Librarian asks clarification questions until the user explicitly approves that the discovery phase is final.
6. Librarian updates context in the task worktree when the Q&A reveals reusable project knowledge.
7. Commit the context update as the first step commit.
8. Create a beads epic for the task using the Beads CLI commands from the Engineer system prompt.
9. Break the epic into subitems using the epic template below.
10. Librarian outputs a context brief for the Engineer.
11. Engineer implements the coding tasks and tests.
12. Commit the engineering work as the next step commit.
13. E2E Engineer runs the required e2e tests.
    - If tests fail, steer the Engineer back to implementation and repeat until there are no failures.
    - Each e2e test is represented by its own bead.
    - Failed tests do not need bead updates unless the workflow tool requires it.
    - If e2e cannot be automated, ask the user.
14. Commit e2e fixes as their own step commit.
15. QA Engineer performs code-quality review.
16. Engineer resolves QA findings when needed.
17. Commit QA fixes as their own step commit.
18. Human tests the work and provides feedback.
19. Engineer resolves human feedback.
20. Commit human-feedback fixes as their own step commit.
21. Librarian reviews the completed work and updates context when the work produced reusable project knowledge.
22. Commit the final context update as the final step commit.
23. Merge the worktree with a regular merge.
24. If merge conflicts occur, invoke the Engineer with a merge-resolution prompt.
25. Delete the worktree after the merge is complete.

## Task ID Policy

Task IDs should follow this format:

```text
<PROJECT>-<NUMBER>-<slug>
```

Example:

```text
NEX-42-bg-session-fix
```

Rules:

- `<PROJECT>` is a 3-5 letter uppercase project key.
- `<NUMBER>` is the workflow sequence number.
- `<slug>` is a short kebab-case summary.
- The same ID is used for the branch, worktree, beads epic, and `just dev-run <id>`.

## Commit Policy

There must be one commit per workflow step that changes files.

Commits must use Commitizen Conventional Commits format:

```text
type(scope): summary
```

Examples:

```text
docs(context): update workflow rules
test(e2e): add background session regression
```

Example sequence:

1. Initial context update from Librarian discovery.
2. First engineering implementation.
3. E2E fixes.
4. QA fixes.
5. Human-feedback fixes.
6. Final context update by Librarian.

## Context Rules

- `./context/.rules` is authoritative.
- The Librarian reads `./context/.rules` to learn context structure and update rules.
- The Librarian must not edit `./context/.rules`.
- Only the user edits `./context/.rules`.
- Project-specific e2e requirements must be defined at the root of `./context/`, preferably in `./context/e2e.md`.
- Engineers receive information from the Librarian context brief, references, and project context; they must not guess missing project rules.

## Context Brief

The Librarian context brief should include:

- Goal.
- Scope.
- Non-goals.
- Relevant rules.
- Relevant files.
- Relevant references.
- Risks.
- Assumptions.
- Test strategy.
- E2E rule.
- Acceptance criteria.
- Handoff notes.

## UI

When a workflow is active, the Agents widget shows one item per workflow:

1. Top line: epic name.
2. Second line or subitem: current workflow step.

The `/workflows` view is the upgraded workflow-focused view of `/agents`. It shows all concurrent epics running in parallel.

Each workflow should track:

- ID.
- Epic title.
- Status.
- Current step.
- Worktree path.
- Branch.
- Owner agent.
- Beads IDs.
- `dev-run` command.
- Last commit.
- Blockers.
- Assumptions.
- Last updated time.

When ready for human testing, the widget shows a command to run the output:

```bash
just dev-run <id>
```

`<id>` is the task ID.

Behavior:

- For a web app, `just dev-run <id>` opens the webserver for that task worktree on an available port.
- For a CLI app that normally runs with `just dev`, `just dev-run <id>` runs `just dev` from the task worktree folder.
- If the target worktree is missing, `just dev-run <id>` errors and informs the user that the workflow is not available.

## Worktree Creation

Any worktree created by this workflow is created under:

```text
~/.worktrees/<project>/<branch-or-name>
```

The Engineer receives the exact worktree commands in its system prompt.

## Engineer System Prompt Commands

The Engineer system prompt must include these command patterns instead of exposing dedicated workflow tools.

### Worktree Commands

```bash
git worktree add -b <task-id> ~/.worktrees/<project>/<task-id> <base-branch>
cd ~/.worktrees/<project>/<task-id>
```

### Beads Commands

```bash
bd create "[<task-id>] <epic-title>"
bd create "[<task-id>] implementation: <title> owner=<agent> acceptance=<criteria> test=<cmd>"
bd create "[<task-id>] e2e: <title> owner=<agent> acceptance=<criteria> test=<cmd>"
bd create "[<task-id>] qa: <title> owner=<agent> acceptance=<criteria> test=<cmd>"
bd update <issue-id> --status in_progress
bd update <issue-id> --status done
```

### Step Commit Commands

```bash
git add -A
git commit -m "type(scope): summary"
```

### Merge and Cleanup Commands

```bash
git checkout <target-branch>
git merge --no-ff <task-id>
git worktree remove ~/.worktrees/<project>/<task-id>
```

If merge conflicts occur, the Engineer resolves them using normal Git conflict-resolution commands, reruns relevant validation, stages the resolved files, and completes the merge commit.

## Templates

### Epic Template

Every epic follows this routine workflow:

1. Create the worktree with the task ID.
2. Create implementation tasks.
   - Each major domain or feature area should have a task.
   - The Librarian decides the split from context and references.
3. Create e2e tasks.
   - Each testable e2e scenario should have its own task.
4. Create QA task.
   - Review code quality.
   - Spot hacks, shortcuts, and quick fixes.
5. Create final context update task.
   - Anything the Engineer learned or changed that should become reusable context is passed to the Librarian.

Each subtask must include:

- Acceptance criteria.
- Relevant test command or validation command.
- Owner agent.
