import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createSmartEvalFooterText } from "./render/createSmartEvalFooterText.js";
import { parseSmartEvalOutput } from "./runtime/parseSmartEvalOutput.js";
import { createFailedSmartEvalResult } from "./runtime/createFailedSmartEvalResult.js";
import { createPendingSmartEvalResult } from "./runtime/createPendingSmartEvalResult.js";
import { getSmartEvalConcurrency } from "./runtime/getSmartEvalConcurrency.js";
import { runSmartEvalWorkerPool } from "./runtime/runSmartEvalWorkerPool.js";
import { startSmartEvalStatusIndicator } from "./runtime/startSmartEvalStatusIndicator.js";
import { clearSmartEvalState, setSmartEvalExpanded, setSmartEvalResult } from "./state/smartEvalState.js";
import { createEmptySmartEvalState } from "./storage/createEmptySmartEvalState.js";
import { getMissingSmartEvalTurns } from "./storage/getMissingSmartEvalTurns.js";
import { readSmartEvalState } from "./storage/readSmartEvalState.js";
import { writeSmartEvalState } from "./storage/writeSmartEvalState.js";
import { collectHistoricalEvalTurns } from "./turns/collectHistoricalEvalTurns.js";

const plainTheme = { fg: (_name: "success" | "error" | "muted", text: string) => text };

test("collectHistoricalEvalTurns pairs users with historical assistant turns and tool output", () => {
	const turns = collectHistoricalEvalTurns([
		{ type: "message", message: { role: "user", content: [{ type: "text", text: "fix it" }], timestamp: 1 } },
		{ type: "message", id: "assistant-1", message: { role: "assistant", content: [{ type: "thinking", thinking: "inspect" }, { type: "text", text: "fixed" }], timestamp: 2 } },
		{ type: "message", message: { role: "toolResult", content: [{ type: "text", text: "ok" }], isError: false, timestamp: 3 } },
	]);

	assert.equal(turns.length, 1);
	assert.equal(turns[0]?.turnId, "assistant-1");
	assert.equal(turns[0]?.userText, "fix it");
	assert.equal(turns[0]?.assistantText, "fixed");
	assert.equal(turns[0]?.thinkingText, "inspect");
	assert.match(turns[0]?.toolText ?? "", /tool result: ok/);
});

test("parseSmartEvalOutput normalizes strict JSON question results", () => {
	const result = parseSmartEvalOutput('{"questions":[{"passed":true,"explanation":""},{"passed":false,"explanation":"It missed the request."},{"passed":true,"explanation":""}]}', 42);

	assert.equal(result?.assistantTimestamp, 42);
	assert.deepEqual(result?.questions.map((question) => question.passed), [true, false, true]);
	assert.equal(result?.questions[1]?.explanation, "It missed the request.");
});

test("createSmartEvalFooterText adds compact and expanded score output", () => {
	clearSmartEvalState();
	setSmartEvalResult({
		assistantTimestamp: 7,
		questions: [
			{ question: "Truthful?", passed: true },
			{ question: "Understood?", passed: true },
			{ question: "Tools solved without hacks?", passed: false, explanation: "It used a temporary workaround." },
		],
	});

	assert.equal(createSmartEvalFooterText("Nexus <dev> · 1s", 7, plainTheme), "Nexus <dev> · 1s · 2/3 ✕");
	setSmartEvalExpanded(true);
	assert.match(createSmartEvalFooterText("Nexus <dev> · 1s", 7, plainTheme), /Truthful\?: yes/);
	assert.match(createSmartEvalFooterText("Nexus <dev> · 1s", 7, plainTheme), /Tools solved without hacks\?: no/);
	assert.match(createSmartEvalFooterText("Nexus <dev> · 1s", 7, plainTheme), /why: It used a temporary workaround\./);
	clearSmartEvalState();
});

test("createSmartEvalFooterText shows pending eval as a loader without failure details", () => {
	clearSmartEvalState();
	setSmartEvalExpanded(true);
	setSmartEvalResult(createPendingSmartEvalResult({
		turnId: "pending-turn",
		userText: "u",
		assistantText: "a",
		thinkingText: "",
		toolText: "",
		assistantTimestamp: 8,
	}));

	const text = createSmartEvalFooterText("Nexus <dev> · 1s", 8, plainTheme);
	assert.match(text, /evaluating eval/);
	assert.doesNotMatch(text, /0\/3/);
	assert.doesNotMatch(text, /why: Eval generation is pending/);
	clearSmartEvalState();
});

test("smart-eval status indicator shows and clears prep progress", () => {
	const statuses: Array<string | undefined> = [];
	const indicator = startSmartEvalStatusIndicator({
		hasUI: true,
		ui: { setStatus: (_key, message) => statuses.push(message) },
	}, 2);

	indicator.setProgress(1, 2);
	indicator.stop();

	assert.match(statuses[0] ?? "", /prepping evals 0\/2/);
	assert.ok(statuses.some((status) => status?.includes("prepping evals 1/2")));
	assert.equal(statuses.at(-1), undefined);
});

test("pending smart-eval generation creates a stored non-retry placeholder", () => {
	const result = createPendingSmartEvalResult({
		userText: "u",
		assistantText: "a",
		thinkingText: "",
		toolText: "",
		turnId: "turn-98",
		assistantTimestamp: 98,
	});

	assert.equal(result.assistantTimestamp, 98);
	assert.equal(result.turnId, "turn-98");
	assert.equal(result.status, "pending");
	assert.equal(result.questions.length, 3);
	assert.match(result.questions[0]?.explanation ?? "", /pending/);
});

test("failed smart-eval generation creates a stored non-retry result", () => {
	const result = createFailedSmartEvalResult({
		userText: "u",
		assistantText: "a",
		thinkingText: "",
		toolText: "",
		turnId: "turn-99",
		assistantTimestamp: 99,
	});

	assert.equal(result.assistantTimestamp, 99);
	assert.equal(result.questions.length, 3);
	assert.equal(result.questions.every((question) => question.passed === false), true);
	assert.match(result.questions[0]?.explanation ?? "", /Eval generation failed/);
});

test("smart-eval concurrency is bounded and configurable", () => {
	assert.equal(getSmartEvalConcurrency(undefined), 4);
	assert.equal(getSmartEvalConcurrency("2"), 2);
	assert.equal(getSmartEvalConcurrency("99"), 8);
});

test("smart-eval worker pool runs items in parallel", async () => {
	let active = 0;
	let maxActive = 0;
	await runSmartEvalWorkerPool({
		items: [1, 2, 3, 4],
		concurrency: 2,
		onItem: async () => {
			active += 1;
			maxActive = Math.max(maxActive, active);
			await new Promise((resolve) => setTimeout(resolve, 20));
			active -= 1;
		},
	});

	assert.equal(maxActive, 2);
});

test("smart-eval refresh indicator always shows refresh progress until stopped", () => {
	const statuses: Array<string | undefined> = [];
	const widgets: Array<string[] | undefined> = [];
	const indicator = startSmartEvalStatusIndicator({
		hasUI: true,
		ui: {
			setStatus: (_key, message) => statuses.push(message),
			setWidget: (_key, content) => widgets.push(content),
		},
	}, 10, "Refreshing eval");

	indicator.setProgress(4, 10);
	indicator.setProgress(10, 10);
	indicator.stop();

	assert.match(statuses[0] ?? "", /Refreshing eval 0\/10/);
	assert.ok(statuses.some((status) => status?.includes("Refreshing eval 4/10")));
	assert.ok(statuses.some((status) => status?.includes("Refreshing eval 10/10")));
	assert.ok(widgets.some((widget) => widget?.[0]?.includes("Refreshing eval 10/10")));
	assert.equal(statuses.at(-1), undefined);
	assert.equal(widgets.at(-1), undefined);
});

test("smart-eval state persists and filters already evaluated turns", async () => {
	const dir = await mkdtemp(join(tmpdir(), "smart-eval-"));
	const statePath = join(dir, "session.state.json");
	const markdownPath = join(dir, "session.evals.md");
	const state = createEmptySmartEvalState("session", "/repo", "/sessions/session.jsonl");
	state.turns.push({
		index: 1,
		evaluatedAt: 10,
		userText: "question",
		assistantText: "answer",
		thinkingText: "thinking",
		toolText: "tool",
		turnId: "turn-20",
		assistantTimestamp: 20,
		result: { assistantTimestamp: 20, turnId: "turn-20", questions: [{ question: "Truthful?", passed: false, explanation: "The answer was unsupported." }] },
	});

	await writeSmartEvalState(statePath, markdownPath, state);
	const restored = await readSmartEvalState(statePath, "session", "/repo", "/sessions/session.jsonl");
	const missing = getMissingSmartEvalTurns([
		{ turnId: "turn-20", userText: "question", assistantText: "answer", thinkingText: "thinking", toolText: "tool", assistantTimestamp: 20 },
		{ turnId: "turn-30", userText: "next", assistantText: "next answer", thinkingText: "", toolText: "", assistantTimestamp: 30 },
	], restored);

	assert.equal(restored.turns.length, 1);
	assert.deepEqual(missing.map((turn) => turn.assistantTimestamp), [30]);
	const markdown = await readFile(markdownPath, "utf8");
	assert.match(markdown, /# Smart evals: session/);
	assert.match(markdown, /why: The answer was unsupported\./);
	await rm(dir, { recursive: true, force: true });
});
