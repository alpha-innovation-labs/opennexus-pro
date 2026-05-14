import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE } from "../../../packages/extensions-pro/src/observations/shared/defaultObservationRecreationPromptTemplate.js";
import { renderObservationRecreationPrompt } from "../../../apps/tui/src/cli/observations/renderObservationRecreationPrompt.js";

const messages = "<message index=\"1\" role=\"user\">\n<text>Hello</text>\n</message>";

test("observation prompt override replaces the message placeholder", () => {
	const prompt = renderObservationRecreationPrompt(messages, "Custom instructions\n\n{{messages}}");

	assert.equal(prompt, `Custom instructions\n\n${messages}`);
});

test("default observation prompt template includes message placeholder", () => {
	const prompt = renderObservationRecreationPrompt(messages, DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE);

	assert.match(prompt, /You recreate the final high-level observation log/u);
	assert.match(prompt, /<message index="1" role="user">/u);
	assert.doesNotMatch(prompt, /\{\{messages\}\}/u);
});
