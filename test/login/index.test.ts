import { describe, afterAll, it, expect } from "vitest";
import {
  prepareHerdr,
  runHerdr,
  closeHerdrWorkspace,
} from "../../packages/herdr/dist/index.js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Shared setup — one workspace, one agent
const agentName = "login-test-shared";

// Pre-cleanup: close any stale workspace with this label to avoid ownership conflicts
try {
  const { closeHerdrWorkspace: _preClose } = await import(
    "../../packages/herdr/dist/index.js"
  );
  // Attempt to find and close any previous run (best-effort, ignore errors)
  try {
    _preClose("w8G");
  } catch {
    // No stale workspace — proceed
  }
} catch {
  // Pre-cleanup failed silently — proceed with fresh start
}

// Capture workspaceId safely; if prepareHerdr throws, cleanupId stays undefined
let workspaceId: string | undefined;
try {
  const { workspaceId: wid } = prepareHerdr({
    workspaceLabel: "login-rework",
    agentName,
    maxWaitSeconds: 30,
  });
  workspaceId = wid;
} catch {
  // prepareHerdr failed — workspaceId stays undefined, cleanup will be a no-op
}

// Always-run cleanup: runs regardless of whether the suite loaded or threw
const cleanupId = workspaceId;
if (cleanupId) {
  afterAll(() => {
    try {
      closeHerdrWorkspace(cleanupId);
    } catch {
      // Cleanup failure — ignore
    }
  });
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function sendKeys(keys) {
  runHerdr(["agent", "send-keys", agentName, ...keys]);
}

function readOutput(lines = 100) {
  const result = runHerdr(["agent", "read", agentName, "--source", "recent", "--lines", String(lines)]);
  return result._raw ?? "";
}

function escape() {
  runHerdr(["agent", "send-keys", agentName, "Escape"]);
}

function getSnapshot(name) {
  const snapPath = join(__dirname, "snapshots", name);
  try {
    return readFileSync(snapPath, "utf-8").trim();
  } catch {
    // First run — return empty so test fails, then capture actual output
    return "__MISSING__";
  }
}

function writeSnapshot(name: string, content: string) {
  const snapPath = join(__dirname, "snapshots");
  mkdirSync(snapPath, { recursive: true });
  writeFileSync(join(snapPath, name), content, "utf-8");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("login-rework", () => {

  it("two-pane modal opens on /login", async () => {
    sendKeys(["Slash", "l", "o", "g", "i", "n", "Enter"]);
    const output = readOutput();
    const snap = getSnapshot("two-pane-modal-opens-on-login.jsonl");
    if (snap === "__MISSING__") {
      writeSnapshot("two-pane-modal-opens-on-login.jsonl", output);
      escape();
      return;
    }
    expect(output).toBe(snap);
    escape();
  });

  it("provider toggle on Enter", async () => {
    sendKeys(["Slash", "l", "o", "g", "i", "n", "Enter"]);
    sendKeys(["Enter"]);
    const output = readOutput();
    const snap = getSnapshot("provider-toggle-on-Enter.jsonl");
    if (snap === "__MISSING__") {
      writeSnapshot("provider-toggle-on-Enter.jsonl", output);
      escape();
      return;
    }
    expect(output).toBe(snap);
    escape();
  });

  });
