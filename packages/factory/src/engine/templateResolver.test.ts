/**
 * Tests for templateResolver — pure function.
 *
 * Tests all template variable types:
 *   {{input-name}}  with various input values
 *   <previous-output> with string/null
 *   <output:stepId> with various output values
 *   {{item}} for foreach
 *   Unresolvable variables (should throw)
 *   Escaping (literal < and {{)
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { templateResolver } from "./templateResolver.js";

describe("templateResolver", () => {
	const baseCtx = {
		outputs: {},
		previousOutput: null,
		inputs: {},
	} as const;

	it("replaces {{input-name}} from inputs map", () => {
		const result = templateResolver("Hello {{name}}!", {
			...baseCtx,
			inputs: { name: "World" },
		});
		assert.strictEqual(result, "Hello World!");
	});

	it("replaces {{input-name}} with hyphens converted to underscores", () => {
		const result = templateResolver("Value: {{my-input}}", {
			...baseCtx,
			inputs: { my_input: "test-value" },
		});
		assert.strictEqual(result, "Value: test-value");
	});

	it("throws on unresolvable {{input-name}}", () => {
		assert.throws(
			() => templateResolver("Hello {{missing}}!", { ...baseCtx }),
			/Unresolved template variable \{\{missing\}\}/,
		);
	});

	it("replaces <previous-output> when available", () => {
		const result = templateResolver("Result: <previous-output>", {
			...baseCtx,
			previousOutput: "hello world",
		});
		assert.strictEqual(result, "Result: hello world");
	});

	it("throws on <previous-output> when not available", () => {
		assert.throws(
			() => templateResolver("Result: <previous-output>", { ...baseCtx }),
			/<previous-output> not available/,
		);
	});

	it("replaces <output:stepId> when available", () => {
		const result = templateResolver("Data: <output:agent-1>", {
			...baseCtx,
			outputs: { "agent-1": "joke content" },
		});
		assert.strictEqual(result, "Data: joke content");
	});

	it("throws on <output:stepId> when not available", () => {
		assert.throws(
			() => templateResolver("Data: <output:missing>", { ...baseCtx }),
			/Unresolved template <output:missing>/,
		);
	});

	it("replaces {{item}} for foreach", () => {
		const result = templateResolver("Item: {{item}}", {
			...baseCtx,
			item: "current-file.ts",
		});
		assert.strictEqual(result, "Item: current-file.ts");
	});

	it("throws on {{item}} when not in foreach context", () => {
		assert.throws(
			() => templateResolver("Item: {{item}}", { ...baseCtx }),
			/Template variable \{\{item\}\} not resolved/,
		);
	});

	it("handles multiple template variables in one string", () => {
		const result = templateResolver(
			"Input: {{name}}, Previous: <previous-output>, Output: <output:step-1>",
			{
				...baseCtx,
				inputs: { name: "test" },
				previousOutput: "prev-data",
				outputs: { "step-1": "step-output" },
			},
		);
		assert.strictEqual(
			result,
			"Input: test, Previous: prev-data, Output: step-output",
		);
	});

	it("leaves unrecognizable patterns unchanged", () => {
		const result = templateResolver("Literal: <unclosed and {{unclosed", {
			...baseCtx,
		});
		assert.strictEqual(result, "Literal: <unclosed and {{unclosed");
	});

	it("handles empty strings", () => {
		const result = templateResolver("", { ...baseCtx });
		assert.strictEqual(result, "");
	});
});
