import assert from "node:assert/strict";
import test from "node:test";
import { WorkspaceSessionsModal, buildSessionDetailLines } from "../../../src/extensions/workspace/WorkspaceSessionsModal.js";
import { formatSessionLabel } from "../../../src/extensions/workspace/formatSessionLabel.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("workspace session picker renders in the virtual terminal", async () => {
  const session = {
    path: "/tmp/session.jsonl",
    cwd: "/tmp/project",
    name: "Refactor Session",
    firstMessage: "Refactor the session picker",
    messageCount: 12,
    modified: new Date("2026-01-01T10:00:00Z"),
    created: new Date("2026-01-01T09:00:00Z"),
  };
  const items = [{ label: formatSessionLabel(session as never), value: session.path, description: session.cwd }];
  const details = new Map([[session.path, buildSessionDetailLines(session, undefined)]]);

  const viewport = await renderComponentInVirtualTerminal(
    () => new WorkspaceSessionsModal(createTestTheme(), items, details, () => undefined),
  );

  const output = viewport.join("\n");
  assert.match(output, /Sessions/);
  assert.match(output, /Details/);
  assert.match(output, /Refactor Session/);
  assert.match(output, /available/);
});
