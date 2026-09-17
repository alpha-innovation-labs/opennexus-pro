import { describe, expect, it, vi } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { visibleWidth } from "@earendil-works/pi-tui";
vi.mock("../packages/extension-core/slash-menu/src/readResumeSessionStats", () => ({
	readResumeSessionStats: () => ({ humanMessages: 1, toolCalls: 24, thinkingBlocks: 16 }),
}));
import { createResumeLeaves } from "../packages/extension-core/slash-menu/src/createResumeLeaves";
import { renderSelectListLines } from "../packages/tui-kit/src/modal/select/renderSelectListLines";
const session = (path: string, modified: number, parentSessionPath?: string) => ({
	path, modified: new Date(modified), parentSessionPath, name: path,
});

describe("resume session tree", () => {
	it("sorts by subtree activity and preserves nested connectors without mutating input", () => {
		const input = [session("/other", 5), session("/root", 1), session("/child", 3, "/root"), session("/grandchild", 10, "/child"), session("/sibling", 2, "/root")];
		const leaves = createResumeLeaves(input);
		expect(leaves.map(l => l.value)).toEqual(["/root", "/child", "/grandchild", "/sibling", "/other"]);
		expect(leaves.map(l => l.resumeTreePrefix)).toEqual(["", "  ├─ ", "  │  └─ ", "  └─ ", ""]);
		expect(input[0].path).toBe("/other");
	});
	it("keeps orphans and cyclic parent links visible as roots", () => {
		const leaves = createResumeLeaves([session("/orphan", 1, "/missing"), session("/a", 2, "/b"), session("/b", 3, "/a"), session("/self", 4, "/self")]);
		expect(leaves).toHaveLength(4);
		expect(leaves.every(l => l.resumeTreePrefix === "")).toBe(true);
	});
	it("uses the first message for unnamed sessions", () => {
		expect(createResumeLeaves([{ path: "/a", modified: new Date(), firstMessage: "Hello" }])[0].label).toBe("Hello");
	});
	it("resolves existing task descriptions from the parent without renaming sessions", () => {
		const dir = mkdtempSync(join(tmpdir(), "resume-tasks-"));
		try {
			const parent = join(dir, "parent.jsonl");
			writeFileSync(parent, [
				JSON.stringify({ type: "custom", customType: "subagents:record", data: { id: "0bbc324b-more", description: "Investigate mouse selection during inference" } }),
				JSON.stringify({ type: "message", message: { role: "toolResult", toolName: "Agent", details: { agentId: "12345678-more", description: "Running task" } } }),
				"{partial",
			].join("\n"));
			const child = { ...session("/child", 1, parent), name: "Explore#0bbc324b" };
			const leaves = createResumeLeaves([child, { ...session("/running", 2, parent), name: "Explore#12345678" }, { ...session("/unknown", 3, parent), name: "Explore#87654321" }]);
			expect(leaves.find(l => l.value === "/child")?.label).toBe("Explore  Investigate mouse selection during inference");
			expect(leaves.find(l => l.value === "/running")?.label).toBe("Explore  Running task");
			expect(leaves.find(l => l.value === "/unknown")?.label).toBe("Explore#87654321");
			expect(child.name).toBe("Explore#0bbc324b");
		} finally { rmSync(dir, { recursive: true, force: true }); }
	});
	it.each([12, 40, 100])("renders one bounded row at width %i", width => {
		const lines = renderSelectListLines({
			items: [{ value: "a", label: "A long session title ".repeat(8), description: "counts", resumeRow: true, resumeAge: "3h", resumeTreePrefix: "  └─ " } as any],
			maxVisible: 10, selectedIndex: 0, width,
			theme: { fg: (_: string, text: string) => text, bold: (text: string) => text } as any,
		});
		expect(lines).toHaveLength(1);
		expect(visibleWidth(lines[0])).toBeLessThanOrEqual(width);
		if (width >= 40) expect(lines[0]).toMatch(/counts  3h$/);
	});
});
