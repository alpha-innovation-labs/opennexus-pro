import assert from "node:assert/strict";
import test from "node:test";
import { buildAssistantObservationPrompt } from "../../../packages/extensions-pro/src/observations/tracker/buildAssistantObservationPrompt.js";
import { buildTopicDecisionPrompt } from "../../../packages/extensions-pro/src/observations/tracker/buildTopicDecisionPrompt.js";
import { parseAssistantObservationOutput } from "../../../packages/extensions-pro/src/observations/tracker/parseAssistantObservationOutput.js";
import { parseTopicDecisionOutput } from "../../../packages/extensions-pro/src/observations/tracker/parseTopicDecisionOutput.js";
import type { ObservationTopic } from "../../../packages/extensions-pro/src/observations/tracker/types.js";

const currentTopic: ObservationTopic = {
	index: 1,
	title: "Implement observations storage",
	startedAt: 1,
	sourceMessageIndex: 1,
	userMessageIndexes: [1],
	userMessages: ["please implement observations plan"],
	assistantBullets: ["Confirmed storage should use one JSON artifact"],
};

test("live topic prompt uses current intent batch and JSON decisions", () => {
	const prompt = buildTopicDecisionPrompt(currentTopic, "also hide prompt editing in release");

	assert.match(prompt, /Current intent batch/u);
	assert.match(prompt, /please implement observations plan/u);
	assert.match(prompt, /\{"action":"keep"\}/u);
	assert.deepEqual(parseTopicDecisionOutput('{"action":"keep"}'), { action: "keep" });
	assert.deepEqual(parseTopicDecisionOutput('{"action":"new_topic","title":"Hide prompt editing"}'), {
		action: "new_topic",
		title: "Hide prompt editing",
	});
	assert.equal(parseTopicDecisionOutput("- Hide prompt editing"), undefined);
});

test("assistant observation prompt requires validated JSON arrays", () => {
	const prompt = buildAssistantObservationPrompt("Implement observations", [], "decided JSON", "done");

	assert.match(prompt, /JSON array/u);
	assert.deepEqual(parseAssistantObservationOutput('["Chose JSON validation"]'), ["Chose JSON validation"]);
	assert.deepEqual(parseAssistantObservationOutput("- Chose JSON validation"), []);
});
