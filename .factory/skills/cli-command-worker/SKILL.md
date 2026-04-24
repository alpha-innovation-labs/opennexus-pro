---
name: cli-command-worker
description: Implements and verifies exact-output CLI/just command behavior.
---

# CLI Command Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use this skill for features that add or change repository CLI commands, just recipes, npm script forwarding, or exact command output behavior.

## Required Skills

None.

## Work Procedure

1. Read `mission.md`, `validation-contract.md`, `AGENTS.md`, `.factory/services.yaml`, and `.factory/library/architecture.md` before editing.
2. Inspect the relevant justfile/CLI/test files and identify the smallest safe boundary for the command behavior.
3. Write failing regression tests first. The tests must assert exit code, stdout, stderr, and representative compatibility behavior where required.
4. Run the focused test command and confirm the new test fails for the expected reason before implementing.
5. Implement the minimal change needed to pass the tests. Preserve existing command forwarding and avoid changes to unrelated dirty files.
6. Run the focused tests again. Then manually run the exact user commands (`just dev ping`, `just pong`) and record exact observed output.
7. Run broader validation that is reasonable for the touched area, using `.factory/services.yaml` commands. If the full suite is too broad or pre-existing failures appear, capture exact evidence and explain.
8. Ensure no long-running processes are left behind.

## Example Handoff

```json
{
  "salientSummary": "Implemented exact-output just command smoke paths for `just dev ping` and `just pong`; focused CLI tests pass and direct command checks produce only the required output.",
  "whatWasImplemented": "Added command handling and regression coverage so `just dev ping` exits 0 with stdout exactly `pong\\n`, `just pong` exits 0 with stdout exactly `ping\\n`, and non-ping dev argument forwarding remains unchanged.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      {
        "command": "node_modules/.bin/tsx --test --test-concurrency=1 test/e2e/cli/devPingCommand.test.ts",
        "exitCode": 0,
        "observation": "Focused regression tests passed, including exact stdout/stderr assertions."
      },
      {
        "command": "just dev ping",
        "exitCode": 0,
        "observation": "stdout exactly `pong\\n`; stderr empty."
      },
      {
        "command": "just pong",
        "exitCode": 0,
        "observation": "stdout exactly `ping\\n`; stderr empty."
      }
    ],
    "interactiveChecks": []
  },
  "tests.added": [
    {
      "file": "test/e2e/cli/devPingCommand.test.ts",
      "cases": [
        {
          "name": "just dev ping prints exact pong output",
          "verifies": "Exit code 0, stdout `pong\\n`, stderr empty, no app startup output."
        },
        {
          "name": "just pong prints exact ping output",
          "verifies": "Exit code 0, stdout `ping\\n`, stderr empty."
        }
      ]
    }
  ],
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- Exact output requirements conflict with existing unavoidable tool output.
- Preserving compatibility requires a larger CLI architecture change than the feature describes.
- Tests reveal unrelated pre-existing failures that prevent verification of the changed command behavior.
