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

function sendKeys(keys: string[]) {
  runHerdr(["agent", "send-keys", agentName, ...keys]);
}

function readOutput(lines = 100): string {
  const result = runHerdr(["agent", "read", agentName, "--source", "recent", "--lines", String(lines)]);
  return (result as { _raw?: string })._raw ?? "";
}

function _sendEscape() {
  runHerdr(["agent", "send-keys", agentName, "Escape"]);
}

const actualDir = join(__dirname, "snapshots", "actual");
mkdirSync(actualDir, { recursive: true });

function getSnapshot(name: string): string {
  const snapPath = join(__dirname, "snapshots", name);
  try {
    return readFileSync(snapPath, "utf-8").trim();
  } catch {
    // First run — return empty so test fails, then capture actual output
    return "__MISSING__";
  }
}

function writeActual(name: string, content: string) {
  writeFileSync(join(actualDir, name), content, "utf-8");
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

  // Normalize timing footer: replace any elapsed time with 0:00 so
  // non-deterministic runtimes don't break snapshot equality.
  const NORMALIZE_TIMING_RE = /\b0\.2\.29 \[⏱ \d+:\d+\]/;
  function normalizeTiming(text: string): string {
    return text.replace(NORMALIZE_TIMING_RE, "0.2.29 [⏱ 0:00]");
  }

  it("two-pane modal opens on /login", async () => {
    sendKeys(["Slash", "l", "o", "g", "i", "n", "Enter"]);
    const output = readOutput();
    writeActual("two-pane-modal-opens-on-login.jsonl", output);
    const snap = getSnapshot("two-pane-modal-opens-on-login.jsonl");
    if (snap === "__MISSING__") {
      writeSnapshot("two-pane-modal-opens-on-login.jsonl", output);
      escape();
      return;
    }
    expect(normalizeTiming(output)).toBe(normalizeTiming(snap));
    escape();
  });

  it("provider toggle on Enter", async () => {
    sendKeys(["Slash", "l", "o", "g", "i", "n", "Enter"]);
    sendKeys(["Enter"]);
    const output = readOutput();
    writeActual("provider-toggle-on-Enter.jsonl", output);
    const snap = getSnapshot("provider-toggle-on-Enter.jsonl");
    if (snap === "__MISSING__") {
      writeSnapshot("provider-toggle-on-Enter.jsonl", output);
      escape();
      return;
    }
    expect(normalizeTiming(output)).toBe(normalizeTiming(snap));
    escape();
  });

});
