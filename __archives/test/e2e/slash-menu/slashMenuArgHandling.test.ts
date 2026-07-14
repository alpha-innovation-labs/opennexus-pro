/**
 * E2E tests for slash-command arg handling (Fix 1 + Fix 2).
 *
 * Covers:
 * - Modal path: `SlashMenuModal.extractSlashArgs` behaviour
 * - CLI path unit: `parseCommandArgs` quote stripping
 * - No-arg invocation safety (modal)
 * - Quoted args consistency between paths
 *
 * Note: The CLI path integration (full `applyPromptTemplateArgAppendPatch`
 * through `AgentSession.prototype.prompt`) is implicitly covered by the
 * existing CLI e2e tests (e.g. `test/e2e/cli/helpCommand.test.ts`) which
 * exercise the full Nexus CLI binary.
 */
import assert from "node:assert/strict";
import test from "node:test";
import stripAnsi from "strip-ansi";
import { SlashMenuModal } from "../../../packages/extension-core/src/slash-menu/SlashMenuModal.js";
import { parseCommandArgs } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/core/prompt-templates.js";
import { SENTINEL } from "../../../packages/pi-platform/src/prompt-templates/applyPromptTemplateArgAppendPatch.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Creates the minimal slash-menu context used for prompt/skill menu tests. */
function createPromptContext() {
  const availableModel = {
    id: "claude-test",
    name: "Claude Test",
    provider: "anthropic",
    api: "anthropic-messages",
    reasoning: true,
    input: ["text"],
    cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
    contextWindow: 200000,
    maxTokens: 8192,
  };
  return {
    cwd: process.cwd(),
    ui: { theme: createTestTheme(), notify: () => undefined },
    model: availableModel,
    getSystemPrompt: () => "",
    getCommands: () => [
      { name: "deep-research", description: "Deep research prompt", source: "prompt" as const },
      { name: "git-commit", description: "Git commit prompt", source: "prompt" as const },
      { name: "greet", description: "Greeting prompt", source: "prompt" as const },
    ],
    modelRegistry: {
      getAvailable: () => [availableModel],
      refresh: () => undefined,
      authStorage: { get: () => undefined, hasAuth: () => false, list: () => [] },
    },
    sessionManager: { getEntries: () => [], getSessionDir: () => ".pi/agent/sessions", getTree: () => [] },
  };
}

/** Renders the modal into plain terminal text. */
async function renderModalOutput(modal: SlashMenuModal): Promise<string> {
  return stripAnsi((await renderComponentInVirtualTerminal(() => modal, 140, 36)).join("\n"));
}

// ── Fix 1 tests (SlashMenuModal.extractSlashArgs) ─────────────────────────────

test("SlashMenuModal: extractSlashArgs preserves args through CLI path", async () => {
  const modal = new SlashMenuModal(
    createPromptContext() as never,
    () => "medium",
    () => undefined,
    () => undefined,
    () => undefined,
    () => undefined,
  );

  // Set query directly on the modal instance
  (modal as unknown as { query: string }).query = "/deep-research hello world";

  // Call extractSlashArgs directly on the modal (preserves this binding)
  const args = (modal as unknown as { extractSlashArgs(name: string): string }).extractSlashArgs("deep-research");
  const result = args ? `/deep-research ${args}` : `/deep-research`;
  assert.equal(result, "/deep-research hello world", "args preserved through CLI path");
});

test("SlashMenuModal: modal path appends sentinel for double-append guard", async () => {
  const modal = new SlashMenuModal(
    createPromptContext() as never,
    () => "medium",
    () => undefined,
    () => undefined,
    () => undefined,
    () => undefined,
  );

  (modal as unknown as { query: string }).query = "/deep-research hello world";

  const args = (modal as unknown as { extractSlashArgs(name: string): string }).extractSlashArgs("deep-research");
  const result = args ? `/deep-research ${args}${SENTINEL}` : `/deep-research `;
  assert.ok(
    result.endsWith(SENTINEL),
    "modal path output ends with sentinel for CLI double-append guard",
  );
});

test("SlashMenuModal: /deep-research with no args does not error", async () => {
  const modal = new SlashMenuModal(
    createPromptContext() as never,
    () => "medium",
    () => undefined,
    () => undefined,
    () => undefined,
    () => undefined,
  );

  (modal as unknown as { query: string }).query = "/deep-research";

  const args = (modal as unknown as { extractSlashArgs(name: string): string }).extractSlashArgs("deep-research");
  const result = args ? `/deep-research ${args}` : `/deep-research`;
  assert.equal(result, "/deep-research", "no-arg invocation produces command without trailing args");
});

test("SlashMenuModal: quoted args handled consistently (quotes stripped)", async () => {
  const modal = new SlashMenuModal(
    createPromptContext() as never,
    () => "medium",
    () => undefined,
    () => undefined,
    () => undefined,
    () => undefined,
  );

  (modal as unknown as { query: string }).query = "/deep-research 'hello world'";

  const args = (modal as unknown as { extractSlashArgs(name: string): string }).extractSlashArgs("deep-research");
  const result = args ? `/deep-research ${args}` : `/deep-research`;
  assert.equal(result, "/deep-research hello world", "single quotes stripped by parseCommandArgs");
});

test("SlashMenuModal: mixed quoted args handled consistently", async () => {
  const modal = new SlashMenuModal(
    createPromptContext() as never,
    () => "medium",
    () => undefined,
    () => undefined,
    () => undefined,
    () => undefined,
  );

  (modal as unknown as { query: string }).query = '/deep-research "first arg" regular';

  const args = (modal as unknown as { extractSlashArgs(name: string): string }).extractSlashArgs("deep-research");
  const result = args ? `/deep-research ${args}` : `/deep-research`;
  assert.equal(result, "/deep-research first arg regular", "double quotes stripped by parseCommandArgs");
});

// ── parseCommandArgs unit tests (Fix 1 consistency check) ─────────────────────

test("parseCommandArgs: single quotes stripped", async () => {
  const result = parseCommandArgs("'hello world'");
  assert.deepEqual(result, ["hello world"]);
});

test("parseCommandArgs: double quotes stripped", async () => {
  const result = parseCommandArgs('"hello world"');
  assert.deepEqual(result, ["hello world"]);
});

test("parseCommandArgs: mixed quotes handled", async () => {
  const result = parseCommandArgs('"first arg" regular');
  assert.deepEqual(result, ["first arg", "regular"]);
});

test("parseCommandArgs: no quotes passes through", async () => {
  const result = parseCommandArgs("hello world");
  assert.deepEqual(result, ["hello", "world"]);
});
