import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FakeCmuxExecutable } from "./createFakeCmuxExecutable.js";

/**
 * Creates a fake cmux CLI that returns deterministic workspace JSON.
 *
 * @returns Paths for the fake executable and its command log.
 */
export async function createFakeCmuxWorkspaceExecutable(): Promise<FakeCmuxExecutable> {
	const directoryPath = await mkdtemp(join(tmpdir(), "nexus-cmux-workspaces-"));
	const executablePath = join(directoryPath, "cmux");
	const logPath = join(directoryPath, "cmux.log");
	await writeFile(
		executablePath,
		[
			"#!/bin/sh",
			"if [ -n \"$CMUX_TEST_LOG\" ]; then",
			"  printf '%s\\n' \"$*\" >> \"$CMUX_TEST_LOG\"",
			"fi",
			"if [ -n \"$CMUX_TEST_DELAY\" ]; then",
			"  sleep \"$CMUX_TEST_DELAY\"",
			"fi",
			"case \"$*\" in",
			"  *\"list-workspaces\"*)",
			"    cat <<'JSON'",
			'{"workspaces":[{"id":"workspace-nexus","ref":"workspace:1","title":"Engineering","selected":true,"index":0},{"id":"workspace-shell","ref":"workspace:2","title":"Ops","selected":false,"index":1}]}',
			"JSON",
			"    exit 0",
			"    ;;",
			"  *\"list-panes --workspace workspace:1\"*)",
			"    cat <<'JSON'",
			'{"workspace_id":"workspace-nexus","workspace_ref":"workspace:1","panes":[{"id":"pane-nexus","ref":"pane:1","index":0,"focused":true,"surface_ids":["surface-nexus"],"surface_refs":["surface:1"],"selected_surface_id":"surface-nexus","selected_surface_ref":"surface:1"}]}',
			"JSON",
			"    exit 0",
			"    ;;",
			"  *\"list-panes --workspace workspace:2\"*)",
			"    cat <<'JSON'",
			'{"workspace_id":"workspace-shell","workspace_ref":"workspace:2","panes":[{"id":"pane-shell","ref":"pane:2","index":0,"focused":false,"surface_ids":["surface-shell"],"surface_refs":["surface:2"],"selected_surface_id":"surface-shell","selected_surface_ref":"surface:2"}]}',
			"JSON",
			"    exit 0",
			"    ;;",
			"  *\"list-pane-surfaces --workspace workspace:1 --pane pane:1\"*)",
			"    cat <<'JSON'",
			'{"workspace_id":"workspace-nexus","workspace_ref":"workspace:1","pane_id":"pane-nexus","pane_ref":"pane:1","surfaces":[{"id":"surface-nexus","ref":"surface:1","title":"nexus - old title","type":"terminal","selected":true,"index":0}]}',
			"JSON",
			"    exit 0",
			"    ;;",
			"  *\"list-pane-surfaces --workspace workspace:2 --pane pane:2\"*)",
			"    cat <<'JSON'",
			'{"workspace_id":"workspace-shell","workspace_ref":"workspace:2","pane_id":"pane-shell","pane_ref":"pane:2","surfaces":[{"id":"surface-shell","ref":"surface:2","title":"zsh","type":"terminal","selected":true,"index":0}]}',
			"JSON",
			"    exit 0",
			"    ;;",
			"esac",
			"printf 'unexpected cmux command: %s\\n' \"$*\" >&2",
			"exit 1",
		].join("\n"),
		"utf8",
	);
	await chmod(executablePath, 0o755);
	return { directoryPath, executablePath, logPath };
}
