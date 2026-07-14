import assert from "node:assert/strict";
import test from "node:test";
import { buildObservationSummary } from "../../../packages/extensions-pro/src/observations/tracker/buildObservationSummary.js";
import type { ObservationState } from "../../../packages/extensions-pro/src/observations/tracker/types.js";

/**
 * Builds a test observation state from topics.
 *
 * @param topics Observation topics to include in the state.
 * @returns Observation state suitable for summary tests.
 */
function createState(topics: ObservationState["topics"]): ObservationState {
	return {
		conversationId: "conversation-1",
		cwd: "/tmp/project",
		sessionFile: null,
		updatedAt: 1,
		summary: "",
		topics,
	};
}

test("buildObservationSummary creates one paragraph from every observation", () => {
	const summary = buildObservationSummary(createState([
		{
			index: 1,
			title: "Modal layout",
			startedAt: 1,
			sourceMessageIndex: 1,
			userMessages: ["Show the summary above panes"],
			assistantBullets: ["Added a header summary to the observations modal"],
		},
		{
			index: 2,
			title: "Summary persistence",
			startedAt: 2,
			sourceMessageIndex: 2,
			userMessages: [],
			assistantBullets: ["State stores a compact overview for the session"],
		},
	]));

	assert.equal(summary.includes("\n"), false);
	assert.match(summary, /Modal layout/);
	assert.match(summary, /Summary persistence/);
});

test("buildObservationSummary caps the summary at 360 characters", () => {
	const summary = buildObservationSummary(createState([
		{
			index: 1,
			title: "Long topic",
			startedAt: 1,
			sourceMessageIndex: 1,
			userMessages: ["x".repeat(500)],
			assistantBullets: ["y".repeat(500)],
		},
	]));

	assert.equal(summary.length, 360);
});
