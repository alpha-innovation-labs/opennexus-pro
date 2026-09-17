import { afterEach, describe, expect, it, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { AutocompleteProvider } from "@earendil-works/pi-tui";
import { AtModal } from "../packages/extension-core/neo-editor/src/features/promptline/AtModal";
import { refreshAtTrigger } from "../packages/extension-core/neo-editor/src/features/promptline/trigger/refreshAtTrigger";
import type { AgentManager } from "../packages/extension-core/subagent-tintin/src/agent-manager";
import { createMentionProvider, mentionRoster, type MentionTarget } from "../packages/extension-core/subagent-tintin/src/ui/agent-mention";
import type { ReferenceCompletionItem } from "../packages/extension-core/subagent-tintin/src/ui/reference-completion";
import type { AgentRecord, AgentTombstone } from "../packages/extension-core/subagent-tintin/src/types";
import { createFffAutocompleteProvider } from "../packages/extension-core/fff/src/editor/createFffAutocompleteProvider";
import type { FffRuntime } from "../packages/extension-core/fff/src/runtime/FffRuntime";

vi.mock("node:fs", async importOriginal => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) };
});
vi.mock("node:path", async importOriginal => {
  const actual = await importOriginal<typeof import("node:path")>();
  return { ...actual, resolve: vi.fn(actual.resolve) };
});

const theme = { fg: (_: string, text: string) => text, bg: (_: string, text: string) => text, bold: (text: string) => text } as ExtensionContext["ui"]["theme"];
const unused: MentionTarget = { kind: "type", type: "Explore", handle: "explore", description: "Explore sources. Full description." };
function setup() {
  const pick = vi.fn();
  const close = vi.fn();
  const render = vi.fn();
  const modal = new AtModal("/workspace", theme, pick, close, render);
  const preview = vi.spyOn(modal, "setRightLines");
  return { modal, pick, close, render, preview, text: () => preview.mock.lastCall?.[0].join("\n") ?? "" };
}
async function items(target: MentionTarget) {
  const base: AutocompleteProvider = { getSuggestions: async () => null, applyCompletion: vi.fn() };
  const provider = createFffAutocompleteProvider(createMentionProvider(base, () => [target], () => true), {
    searchFileCandidates: async () => [], trackQuery: vi.fn(),
  } as unknown as FffRuntime);
  return (await provider.getSuggestions(["@"], 0, 1, { signal: new AbortController().signal }))!.items as ReferenceCompletionItem[];
}
afterEach(() => vi.restoreAllMocks());

describe("Neo reference previews", () => {
  it("previews an unused type through FFF without resolving paths, reading files, or selecting", async () => {
    const rows = await items(unused);
    const { modal, text, pick } = setup();
    const read = vi.spyOn(fs, "readFileSync");
    const resolve = vi.spyOn(path, "resolve");
    modal.setItems(rows);
    expect(text()).toContain("@explore\nType: Explore\nExplore sources. Full description.\nAction: start");
    expect(text()).not.toMatch(/Status:|Model:|Session:|Tool uses:|undefined/);
    expect(read).not.toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();
    expect(pick).not.toHaveBeenCalled();
    modal.setQuery("ex");
    expect(modal.render(120).join("\n")).toContain("References");
  });

  it.each(["running", "queued", "completed", "steered", "aborted", "stopped", "error"] as const)("shows accurate %s actions and alias identity", async status => {
    const rows = await items({ kind: "record", handle: "Scout", typeLabel: "Source explorer", record: {
      id: "one", handle: "explore", alias: "Scout", type: "Explore", description: "Inspect sources", status,
      invocation: { modelId: "provider/model" }, sessionFile: "/sessions/one.jsonl", toolUses: 0,
      // A path alone is not resumable: live-record dispatch requires a session.
      session: {} as NonNullable<AgentRecord["session"]>,
    } as AgentRecord });
    const { modal, text, pick } = setup();
    modal.setItems(rows);
    expect(text()).toContain("@Scout\nType: Source explorer (Explore)");
    expect(text()).toContain(`Action: ${["running", "queued"].includes(status) ? "send message" : "resume"}`);
    expect(text()).toContain(`Status: ${status}`);
    expect(text()).toContain("Model: provider/model\nSession: /sessions/one.jsonl\nTool uses: 0");
    expect(pick).not.toHaveBeenCalled();
  });

  it.each([
    { handle: "explore", types: ["Explore"], action: "start", startType: "Explore" },
    { handle: "explore", alias: "Scout", types: ["Explore"], action: "continue in main conversation" },
    { handle: "explore-2", types: ["Explore"], action: "continue in main conversation" },
    { handle: "explore", types: [], action: "continue in main conversation" },
    { handle: "explore", alias: "agent-explore", types: ["Explore"], action: "start", startType: "Explore" },
    { handle: "explore", alias: "Review", types: ["Explore", "Review"], action: "start", startType: "Review" },
  ])("matches fresh-start resolution for failed-start $handle / $alias", async ({ handle, alias, types, action, startType }) => {
    const record = {
      id: "failed", type: "Explore", handle, alias, status: "error", startedAt: 1,
      description: "Failed before session creation", sessionFile: "/not-a-live-session.jsonl",
    } as AgentRecord;
    const manager = { listAgents: () => [record], listTombstones: () => [] } as unknown as AgentManager;
    const roster = mentionRoster(manager, types.map(name => ({ name, description: name })));
    const rows = await items(roster[0]);
    expect(rows[0].value).toBe(`@${alias ?? handle}`);
    expect(rows[0].reference?.agent).toMatchObject({ action });
    expect(rows[0].reference?.agent?.startType).toBe(startType);
    expect(rows[0].description).toContain(startType ? `start ${startType}` : action);
    expect(rows[0].description).not.toContain("resume");
    const { modal, text, pick } = setup();
    const read = vi.spyOn(fs, "readFileSync");
    modal.setItems(rows);
    expect(text()).toContain(`Action: ${action}${startType ? ` (${startType})` : ""}`);
    expect(text()).toContain("Status: error");
    expect(text()).not.toContain("Action: resume");
    expect(read).not.toHaveBeenCalled();
    expect(pick).not.toHaveBeenCalled();
    expect(record.session).toBeUndefined();
  });

  it.each([undefined, "Scout"])("resumes a genuinely resumable in-memory record with alias %s", async alias => {
    const record = { id: "settled", type: "Explore", handle: "explore", alias, status: "completed",
      description: "Finished", session: {} as NonNullable<AgentRecord["session"]>, startedAt: 1,
    } as AgentRecord;
    const manager = { listAgents: () => [record], listTombstones: () => [] } as unknown as AgentManager;
    const [target] = mentionRoster(manager, [{ name: "Explore", description: "Explore" }]);
    const rows = await items(target);
    const { modal, text } = setup();
    modal.setItems(rows);
    expect(text()).toContain("Action: resume");
    expect(text()).not.toContain("Session:");
    expect(rows[0].description).toContain("resume");
    expect(rows[0].reference?.agent?.startType).toBeUndefined();
  });

  it.each(["running", "queued"] as const)("sends to %s records even before a session exists", async status => {
    const rows = await items({ kind: "record", handle: "Scout", typeLabel: "Explore", record: {
      id: "starting", handle: "explore", alias: "Scout", type: "Explore", description: "Starting", status,
    } as AgentRecord });
    const { modal, text } = setup();
    modal.setItems(rows);
    expect(text()).toContain("Action: send message");
    expect(rows[0].description).toContain("send message");
  });

  it("labels remembered sessions resumable, without inventing live metadata", async () => {
    const rows = await items({ kind: "tombstone", handle: "Scout", typeLabel: "Explore", entry: {
      id: "saved", type: "Explore", description: "Remembered", sessionFile: "/saved.jsonl",
    } as AgentTombstone });
    const { modal, text } = setup();
    modal.setItems(rows);
    expect(text()).toContain("Action: resume\nStatus: resumable\nSession: /saved.jsonl");
    expect(text()).not.toMatch(/completed|Model:|Tool uses:/);
  });

  it("keeps metadata-less agents outside filesystem handling", async () => {
    const rows = await items(unused);
    delete rows[0].reference!.agent;
    const { modal, text } = setup();
    const read = vi.spyOn(fs, "readFileSync");
    modal.setItems(rows);
    expect(text()).toBe("@explore\nAgent information unavailable");
    expect(read).not.toHaveBeenCalled();
  });

  it("isolates same-name files, sanitizes/truncates them, and replaces previews on navigation", async () => {
    const rows = await items(unused);
    const { modal, text, pick, close } = setup();
    const read = vi.spyOn(fs, "readFileSync").mockReturnValue("\u001b[31mfile\u001b[0m\n" + Array.from({ length: 20 }, (_, i) => `line ${i}`).join("\n"));
    modal.setItems([...rows, { value: "@explore", label: "explore" }]);
    modal.handleInput("\u001b[B");
    expect(text().split("\n")).toHaveLength(17);
    expect(text()).toContain("[31mfile[0m\nline 0");
    expect(text()).not.toContain("\u001b");
    expect(text()).toMatch(/…$/);
    expect(read).toHaveBeenCalledExactlyOnceWith("/workspace/explore", "utf8");
    // First render resizes the list; equal insertion values must not change identity.
    modal.render(120);
    expect(text()).toContain("[31mfile[0m");
    modal.handleInput("\u001b[A");
    await Promise.resolve();
    expect(text()).toContain("Action: start");
    expect(text()).not.toContain("line 0");
    expect(pick).not.toHaveBeenCalled();
    modal.handleInput("\r");
    expect(pick).toHaveBeenCalledWith(rows[0]);
    modal.handleInput("\u001b");
    expect(close).toHaveBeenCalled();
    modal.setItems([]);
    expect(text()).toBe("No preview");
  });

  it.each(["folder/", "missing"])("preserves unavailable previews for %s", value => {
    const { modal, text } = setup();
    vi.spyOn(fs, "readFileSync").mockImplementation(() => { throw new Error("unavailable"); });
    modal.setItems([{ value: `@${value}`, label: value }]);
    expect(text()).toBe(`@${value}\nPreview unavailable`);
  });

  it("an aborted delayed refresh cannot overwrite the current agent preview", async () => {
    const { modal, text, render } = setup();
    let finish!: (value: { prefix: string; items: ReferenceCompletionItem[] }) => void;
    const provider: AutocompleteProvider = { getSuggestions: () => new Promise(resolve => { finish = resolve; }), applyCompletion: vi.fn() };
    const controller = new AbortController();
    const pending = refreshAtTrigger(modal, provider, ["@"], 0, 1, controller, render);
    controller.abort();
    modal.setItems(await items(unused));
    finish({ prefix: "@", items: [{ value: "@old", label: "old" }] });
    expect(await pending).toBeNull();
    expect(text()).toContain("Action: start");
  });
});
