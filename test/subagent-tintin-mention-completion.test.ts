import { describe, expect, it, vi } from "vitest";
import { CombinedAutocompleteProvider, type AutocompleteProvider, type AutocompleteSuggestions } from "@earendil-works/pi-tui";
import { createFffAutocompleteProvider } from "../packages/extension-core/fff/src/editor/createFffAutocompleteProvider";
import type { FffRuntime } from "../packages/extension-core/fff/src/runtime/FffRuntime";
import type { FffFileCandidate } from "../packages/extension-core/fff/src/shared/types";
import { createMentionProvider, mentionRoster, type MentionTarget } from "../packages/extension-core/subagent-tintin/src/ui/agent-mention";
import type { ReferenceCompletionItem } from "../packages/extension-core/subagent-tintin/src/ui/reference-completion";
import type { AgentManager } from "../packages/extension-core/subagent-tintin/src/agent-manager";
import type { AgentRecord, AgentTombstone } from "../packages/extension-core/subagent-tintin/src/types";

const target: MentionTarget = { kind: "type", type: "Explore", handle: "explore", description: "Explore sources." };
const candidates = (...paths: string[]) => paths.map(relativePath => ({ item: { relativePath, fileName: relativePath.split("/").at(-1) } })) as FffFileCandidate[];
function setup(paths = ["explore"], targets = [target], enabled = true, base?: AutocompleteProvider) {
  const pi = base ?? new CombinedAutocompleteProvider([], process.cwd(), null);
  const runtime = {
    searchFileCandidates: vi.fn(async () => candidates(...paths)),
    trackQuery: vi.fn(async () => {}),
  };
  const mentions = createMentionProvider(pi, () => targets, () => enabled);
  const provider = createFffAutocompleteProvider(mentions, runtime as unknown as FffRuntime);
  return { pi, runtime, mentions, provider };
}
const query = (provider: AutocompleteProvider, text: string, col = text.length, signal = new AbortController().signal) =>
  provider.getSuggestions([text], 0, col, { signal });
const refs = (result: AutocompleteSuggestions | null) => result!.items as ReferenceCompletionItem[];

describe("Tintin / FFF reference composition", () => {
  it.each(["@ex", "@", "@EX"])("keeps same-name agents and files distinct for %s", async text => {
    const { provider, runtime } = setup();
    const result = await query(provider, text);
    expect(refs(result).map(item => [item.value, item.reference?.kind])).toEqual([
      ["@explore", "agent"], ["@explore", "file"],
    ]);
    expect(runtime.searchFileCandidates).toHaveBeenCalledWith(text.slice(1), 20);
  });

  it("does not spend the file result budget on agents; preserves ranked folders and files", async () => {
    const targets = Array.from({ length: 25 }, (_, i) => ({ ...target, type: `Type${i}`, handle: `type${i}` }));
    const { provider } = setup(["z/a.ts", "x.ts", "y.ts"], targets);
    const result = refs(await query(provider, "@"));
    expect(result.filter(item => item.reference?.kind === "agent")).toHaveLength(25);
    expect(result.slice(25).map(item => item.value)).toEqual(["@z", "@z/a.ts", "@x.ts", "@y.ts"]);
  });

  it("uses roster order, hides represented types and deduplicates aliases by target identity", async () => {
    const record = { id: "live", type: "Explore", handle: "explore", alias: "Scout", status: "running", startedAt: 1, description: "Look" } as AgentRecord;
    const tombstone = { id: "saved", type: "Review", handle: "review", description: "Saved" } as AgentTombstone;
    const manager = { listAgents: () => [record], listTombstones: () => [tombstone] } as unknown as AgentManager;
    const targets = mentionRoster(manager, [{ name: "Explore", description: "Type" }, { name: "Review", description: "Type" }, { name: "Build", description: "Build" }]);
    expect(targets.map(item => item.handle)).toEqual(["Scout", "review", "build"]);
    const { provider, mentions, runtime } = setup([], targets);
    expect(refs(await query(provider, "@EX")).map(item => item.value)).toEqual(["@Scout"]);
    expect(refs(await query(provider, "@sc")).map(item => item.value)).toEqual(["@Scout"]);
    const repeated = createFffAutocompleteProvider(createMentionProvider(mentions, () => targets, () => true), runtime as unknown as FffRuntime);
    expect(refs(await query(repeated, "@")).map(item => item.value)).toEqual(["@Scout", "@review", "@build"]);
  });

  it("selecting an agent only inserts its handle, preserves cursor suffix, and never tracks a file", async () => {
    const { provider, runtime, pi } = setup();
    const apply = vi.spyOn(pi, "applyCompletion");
    const text = "ask @ex suffix";
    const result = await query(provider, text, 7);
    expect(provider.applyCompletion([text], 0, 7, result!.items[0], result!.prefix)).toEqual({
      lines: ["ask @explore  suffix"], cursorLine: 0, cursorCol: 13,
    });
    await Promise.resolve();
    expect(runtime.trackQuery).not.toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
  });

  it("routes FFF file insertion to Pi and records only that selection", async () => {
    const { provider, runtime } = setup();
    const result = await query(provider, "@ex");
    expect(provider.applyCompletion(["@ex"], 0, 3, result!.items[1], result!.prefix).lines).toEqual(["@explore "]);
    await Promise.resolve();
    expect(runtime.trackQuery).toHaveBeenCalledExactlyOnceWith("@ex", "explore");
  });

  it("preserves quoted file and folder insertion with a closing quote after the cursor", async () => {
    const { provider, pi } = setup(["my dir/file.txt"]);
    const text = '@"my" end';
    const result = await query(provider, text, 4);
    expect(refs(result).map(item => item.reference?.kind)).toEqual(["folder", "file"]);
    for (const item of result!.items) {
      expect(provider.applyCompletion([text], 0, 4, item, result!.prefix)).toEqual(
        pi.applyCompletion([text], 0, 4, item, result!.prefix),
      );
    }
    expect(provider.applyCompletion([text], 0, 4, result!.items[1], result!.prefix).lines).toEqual(['@"my dir/file.txt"  end']);
    expect(provider.applyCompletion([text], 0, 4, result!.items[0], result!.prefix).lines).toEqual(['@"my dir" end']);
  });

  it("retains different source spans instead of borrowing the merged prefix", async () => {
    const pi = new CombinedAutocompleteProvider([], process.cwd(), null);
    const base: AutocompleteProvider = {
      getSuggestions: async () => ({ prefix: "ex", items: [{ value: "legacy", label: "legacy" }] }),
      applyCompletion: vi.fn(pi.applyCompletion.bind(pi)),
    };
    const { provider } = setup(["explore.txt"], [target], true, base);
    const result = await query(provider, "@ex");
    const legacy = refs(result).find(item => item.value === "legacy")!;
    expect(legacy.reference?.prefix).toBe("ex");
    expect(legacy.reference?.source).toBe(base);
    expect(provider.applyCompletion(["@ex"], 0, 3, legacy, result!.prefix).lines).toEqual(["@legacy"]);
    expect(base.applyCompletion).toHaveBeenLastCalledWith(["@ex"], 0, 3, { value: "legacy", label: "legacy" }, "ex");
  });

  it("deduplicates normalized overlapping paths and repeated wrappers, tracking once", async () => {
    const pi = new CombinedAutocompleteProvider([], process.cwd(), null);
    const base: AutocompleteProvider = {
      getSuggestions: async () => ({ prefix: "@", items: [{ value: '@"./explore"', label: "explore" }] }),
      applyCompletion: pi.applyCompletion.bind(pi),
    };
    const { provider, runtime } = setup(["explore", "explore"], [target], true, base);
    const outerRuntime = { searchFileCandidates: vi.fn(async () => candidates("explore")), trackQuery: vi.fn(async () => {}) };
    const repeated = createFffAutocompleteProvider(provider, outerRuntime as unknown as FffRuntime);
    const result = await query(repeated, "@");
    expect(refs(result).map(item => item.reference?.kind)).toEqual(["agent", "file"]);
    repeated.applyCompletion(["@"], 0, 1, result!.items[1], result!.prefix);
    await Promise.resolve();
    expect(outerRuntime.trackQuery).toHaveBeenCalledTimes(1);
    expect(runtime.trackQuery).not.toHaveBeenCalled();
  });

  it.each(["=@ex", "@src/index", '@"ex'])("does not turn path-only boundary %s into a mention", async text => {
    const { provider } = setup(["explore.txt"]);
    expect(refs(await query(provider, text)).every(item => item.reference?.kind !== "agent")).toBe(true);
  });

  it("retains punctuation mention boundaries when FFF has no token", async () => {
    const { provider, runtime } = setup();
    const result = await query(provider, "。@ex");
    expect(refs(result).map(item => item.value)).toEqual(["@explore"]);
    expect(provider.applyCompletion(["。@ex"], 0, 4, result!.items[0], result!.prefix).lines).toEqual(["。@explore "]);
    expect(runtime.searchFileCandidates).not.toHaveBeenCalled();
  });

  it("preserves mention disablement and normal file-only completion", async () => {
    const { provider } = setup(["explore"], [target], false);
    expect(refs(await query(provider, "@ex")).map(item => item.reference?.kind)).toEqual(["file"]);
  });

  it.each(["throw", "reject", "empty"])("preserves agents on file search %s", async failure => {
    const { provider, runtime } = setup();
    runtime.searchFileCandidates.mockImplementation(() => {
      if (failure === "throw") throw new Error("file failure");
      return failure === "reject" ? Promise.reject(new Error("file failure")) : Promise.resolve([]);
    });
    expect(refs(await query(provider, "@ex")).map(item => item.reference?.kind)).toEqual(["agent"]);
  });

  it.each(["empty", "throw", "reject"])("deduplicates fallback paths after FFF %s while retaining source insertion", async failure => {
    const pi = new CombinedAutocompleteProvider([], process.cwd(), null);
    const file = { value: "@explore", label: "explore" };
    const base: AutocompleteProvider = {
      getSuggestions: async () => ({ prefix: "ex", items: [file, { value: '@"./explore"', label: "explore" }] }),
      applyCompletion: vi.fn(pi.applyCompletion.bind(pi)),
    };
    const { provider, runtime } = setup([], [target], true, base);
    runtime.searchFileCandidates.mockImplementation(() => {
      if (failure === "throw") throw new Error("FFF failed");
      return failure === "reject" ? Promise.reject(new Error("FFF failed")) : Promise.resolve([]);
    });
    const text = "ask @ex suffix";
    const result = await query(provider, text, 7);
    expect(refs(result).map(item => [item.value, item.reference?.kind])).toEqual([
      ["@explore", "agent"], ["@explore", "file"],
    ]);
    const selected = refs(result)[1];
    expect(selected.reference?.source).toBe(base);
    expect(selected.reference?.prefix).toBe("ex");
    expect(provider.applyCompletion([text], 0, 7, selected, result!.prefix)).toEqual(
      pi.applyCompletion([text], 0, 7, file, "ex"),
    );
    expect(base.applyCompletion).toHaveBeenCalledExactlyOnceWith([text], 0, 7, file, "ex");
    expect(provider.applyCompletion([text], 0, 7, result!.items[0], result!.prefix).lines).toEqual(["ask @explore  suffix"]);
    await Promise.resolve();
    expect(runtime.trackQuery).not.toHaveBeenCalled();
    expect(base.applyCompletion).toHaveBeenCalledTimes(1);
  });

  it.each(["empty", "reject"])("returns null when FFF %s and the inner provider have no suggestions", async failure => {
    const { provider, runtime } = setup([], []);
    if (failure === "reject") runtime.searchFileCandidates.mockRejectedValue(new Error("FFF failed"));
    expect(await query(provider, "@ex")).toBeNull();
  });

  it("keeps files when the inner provider fails", async () => {
    const pi = new CombinedAutocompleteProvider([], process.cwd(), null);
    const base = { getSuggestions: () => { throw new Error("inner"); }, applyCompletion: pi.applyCompletion.bind(pi) };
    const runtime = { searchFileCandidates: async () => candidates("explore"), trackQuery: async () => {} };
    const provider = createFffAutocompleteProvider(base, runtime as unknown as FffRuntime);
    expect(refs(await query(provider, "@ex")).map(item => item.value)).toEqual(["@explore"]);
  });

  it("discards aborted results without reentering the base provider", async () => {
    const { provider, runtime, pi } = setup();
    let finish!: (value: FffFileCandidate[]) => void;
    runtime.searchFileCandidates.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const baseQuery = vi.spyOn(pi, "getSuggestions");
    const controller = new AbortController();
    const pending = query(provider, "@ex", 3, controller.signal);
    await Promise.resolve();
    controller.abort();
    finish(candidates("explore"));
    expect(await pending).toBeNull();
    expect(baseQuery).toHaveBeenCalledTimes(1);
    expect(await query(provider, "@ex", 3, controller.signal)).toBeNull();
    expect(baseQuery).toHaveBeenCalledTimes(1);
  });

  it("keeps agent suggestions when both file sources throw", async () => {
    const pi = new CombinedAutocompleteProvider([], process.cwd(), null);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const base = { getSuggestions: () => { throw new Error("inner"); }, applyCompletion: pi.applyCompletion.bind(pi) };
      const { provider, runtime } = setup([], [target], true, base);
      runtime.searchFileCandidates.mockRejectedValue(new Error("FFF"));
      expect(refs(await query(provider, "@ex")).map(item => item.value)).toEqual(["@explore"]);
      expect(refs(await query(provider, "@ex")).map(item => item.value)).toEqual(["@explore"]);
      expect(warn).toHaveBeenCalledTimes(1);
    } finally {
      warn.mockRestore();
    }
  });

  it("delegates unrelated slash completion and file-trigger policy unchanged", async () => {
    const base = new CombinedAutocompleteProvider([{ name: "help", description: "Help" }], process.cwd(), null);
    const { provider, runtime } = setup([], [target], true, base);
    const result = await query(provider, "/he");
    expect(result).toEqual(await query(base, "/he"));
    expect(provider.applyCompletion(["/he"], 0, 3, result!.items[0], result!.prefix)).toEqual(
      base.applyCompletion(["/he"], 0, 3, result!.items[0], result!.prefix),
    );
    expect(runtime.searchFileCandidates).not.toHaveBeenCalled();
    expect(runtime.trackQuery).not.toHaveBeenCalled();
    expect(provider.shouldTriggerFileCompletion?.(["@"], 0, 1)).toBe(base.shouldTriggerFileCompletion(["@"], 0, 1));
  });

  it("guards cancellation and stale responses in the mention wrapper itself", async () => {
    let finish!: (value: AutocompleteSuggestions | null) => void;
    const pi = new CombinedAutocompleteProvider([], process.cwd(), null);
    const base: AutocompleteProvider = {
      getSuggestions: vi.fn().mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValue(null),
      applyCompletion: pi.applyCompletion.bind(pi),
    };
    const mentions = createMentionProvider(base, () => [target], () => true);
    const old = query(mentions, "@e");
    expect(await query(mentions, "@ex")).not.toBeNull();
    finish(null);
    expect(await old).toBeNull();
    const controller = new AbortController();
    vi.mocked(base.getSuggestions).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const aborted = query(mentions, "@ex", 3, controller.signal);
    controller.abort();
    finish(null);
    expect(await aborted).toBeNull();
  });

  it("discards old searches even when their signal was not aborted", async () => {
    const { provider, runtime } = setup();
    let finish!: (value: FffFileCandidate[]) => void;
    runtime.searchFileCandidates.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    const old = query(provider, "@e");
    await Promise.resolve();
    expect(await query(provider, "@ex")).not.toBeNull();
    finish(candidates("old"));
    expect(await old).toBeNull();
  });
 });
