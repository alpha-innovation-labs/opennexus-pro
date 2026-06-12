# e2e_tests — TUI session automation and golden-reference testing

## Overview

This directory contains scripts for automating Nexus TUI sessions in tmux and
capturing ASCII snapshots for regression testing.

## Quick start

### 1. Write a YAML config

Create a YAML file describing the session you want to reproduce:

```yaml
# e2e_tests/scripts/my_test.yaml
sessionName: my-test-session
cwd: /Users/alpha/workspace/alpha-innovation-labs/nexus-tui-awesome
command: /opt/homebrew/lib/node_modules/opennexus/nexus --resume 019eb8e5-3fc3-7105-858a-199c6dff3e8a
waitSeconds: 3

interactions:
  - { type: key, value: "hello world", delay: 500 }
  - { type: wait, value: 2000 }
  - { type: key, value: "ls -la", delay: 300 }
```

### 2. Run the session

```bash
# Via TypeScript (recommended)
tsx e2e_tests/scripts/yamlSessionRunner.ts e2e_tests/scripts/my_test.yaml

# Via bash wrapper
bash e2e_tests/scripts/yaml_session_runner.sh e2e_tests/scripts/my_test.yaml
```

### 3. Approve the snapshot

The script will:
1. Kill any existing tmux session with the same name
2. Create a new tmux session running your command
3. Replay each interaction (key presses, mouse events, waits)
4. Wait for the session to stabilise
5. Capture the full scrollback to `e2e_tests/snapshot.txt`
6. Display the snapshot and prompt you to **approve** or **reject**

On approval, the snapshot is saved as a golden reference under
`e2e_tests/golden/<sessionName>.txt`.

## YAML format

| Key           | Required | Type   | Description                                    |
|---------------|----------|--------|------------------------------------------------|
| `sessionName` | No       | string | Name of the tmux session (default: `nexus-test`) |
| `cwd`         | No       | string | Working directory for the session              |
| `command`     | Yes      | string | Command to run inside the session              |
| `waitSeconds` | No       | number | Seconds to wait before capturing (default: 3)  |
| `interactions`| No       | array  | List of interactions to replay (see below)     |

### Interactions

Each interaction is an object with `type`, `value`, and optional `delay`:

| `type`  | `value` example              | Description                        |
|---------|------------------------------|------------------------------------|
| `key`   | `"hello world"`              | Sends the string + Enter to tmux  |
| `mouse` | `"click 10,20"`              | Sends a mouse event to tmux       |
| `wait`  | `2000`                       | Waits N milliseconds              |

Each interaction can have an optional `delay` (milliseconds) to wait before
sending.

### Example YAML

See `e2e_tests/scripts/sample_session.yaml` for a complete working example.

## Directory structure

```
e2e_tests/
  scripts/
    yamlSessionRunner.ts          # Core YAML parser + session automation + snapshot capture
    yaml_session_runner.sh        # Bash wrapper for the TypeScript runner
    sample_session.yaml           # Working example YAML config
    yamlParser.test.ts            # 11 unit tests for the YAML parser
    yamlSessionRunner.test.ts     # 3 unit tests for config extraction & error handling
  automation.sh                   # Legacy: delegates to scripts/yamlSessionRunner.ts
  automation_failed_tool_call.sh  # Legacy: delegates to scripts/yamlSessionRunner.ts
  test_compact_tool_calls.sh      # Regression: validates compact tool-call rendering
  test_failed_tool_call.sh        # Regression: validates failed tool call error rendering
  golden/                         # Approved golden snapshots (sessionName.txt)
  snapshot.txt                    # Latest captured snapshot (overwritten each run)
  README.md                       # This file
```

## Existing automation scripts

| Script                          | Purpose                                              |
|---------------------------------|------------------------------------------------------|
| `automation.sh [resume-id]`     | Launches Nexus with a resume ID, captures snapshot   |
| `automation_failed_tool_call.sh`| Same, but with a session containing a failed tool call |
| `test_compact_tool_calls.sh`    | Validates compact rendering (no adjacent empty lines) |
| `test_failed_tool_call.sh`      | Validates failed tool call error rendering           |

These legacy scripts delegate to `scripts/yamlSessionRunner.ts` internally.

## Test scripts

| Script                          | What it validates                                    |
|---------------------------------|------------------------------------------------------|
| `test_compact_tool_calls.sh`    | No adjacent empty lines, no gaps between box borders, failed `ls` error visible |
| `test_failed_tool_call.sh`      | Red error box for failed `read`, tool call entry present |

Run with:
```bash
bash e2e_tests/test_compact_tool_calls.sh
bash e2e_tests/test_failed_tool_call.sh
```

## Golden references

Approved snapshots are stored in `e2e_tests/golden/<sessionName>.txt`.
These serve as the regression baseline — future runs are compared against them.

## Parser tests

Unit tests for the YAML parser live in `e2e_tests/scripts/yamlParser.test.ts` (11 tests).
Config extraction tests are in `e2e_tests/scripts/yamlSessionRunner.test.ts` (3 tests).
