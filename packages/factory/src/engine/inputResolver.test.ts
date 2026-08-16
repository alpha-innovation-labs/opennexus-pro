/**
 * Tests for inputResolver — pure function.
 *
 * Tests scoping priority:
 *   Step-local overrides control-level overrides global
 *   CLI overrides defaults
 *   Missing input → undefined
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { resolveInputsForStep } from "./inputResolver.js";

const baseWorkflow = {
	name: "test-workflow",
} as const;

describe("resolveInputsForStep", () => {
	it("resolves step-local inputs", () => {
		const step = { id: "s1", type: "bash" as const, command: "echo hi" };
		const workflow = { ...baseWorkflow, inputs: [{ name: "global-input", default: "global-default" }] };
		const result = resolveInputsForStep(workflow, step, null, {});
		assert.deepStrictEqual(result, { "global-input": "global-default" });
	});

	it("resolves control-level inputs", () => {
		const step = { id: "s1", type: "bash" as const, command: "echo hi" };
		const workflow = {
			...baseWorkflow,
			inputs: [{ name: "global-input", default: "global-default" }],
		} as any;
		const controlBlock = {
			id: "cb1",
			type: "loop_until" as const,
			inputs: [{ name: "control-input", default: "control-default" }],
			steps: [],
		} as any;
		const result = resolveInputsForStep(workflow, step, controlBlock, {});
		assert.deepStrictEqual(result, {
			"global-input": "global-default",
			"control-input": "control-default",
		});
	});

	it("step-local overrides control-level overrides global", () => {
		const step = {
			id: "s1",
			type: "bash" as const,
			command: "echo hi",
			inputs: [{ name: "shared-input", default: "step-default" }],
		} as any;
		const workflow = {
			...baseWorkflow,
			inputs: [{ name: "shared-input", default: "global-default" }],
		} as any;
		const controlBlock = {
			id: "cb1",
			type: "loop_until" as const,
			inputs: [{ name: "shared-input", default: "control-default" }],
			steps: [],
		} as any;
		const result = resolveInputsForStep(workflow, step, controlBlock, {});
		assert.strictEqual(result["shared-input"], "step-default");
	});

	it("CLI overrides defaults", () => {
		const step = { id: "s1", type: "bash" as const, command: "echo hi" };
		const workflow = { ...baseWorkflow, inputs: [{ name: "my-input", default: "default-val" }] };
		const result = resolveInputsForStep(workflow, step, null, { "my-input": "cli-val" });
		assert.strictEqual(result["my-input"], "cli-val");
	});

	it("handles dash-to-underscore conversion", () => {
		const step = { id: "s1", type: "bash" as const, command: "echo hi" };
		const workflow = { ...baseWorkflow, inputs: [{ name: "my-input", default: "default" }] };
		const result = resolveInputsForStep(workflow, step, null, { my_input: "cli-val" });
		assert.strictEqual(result["my-input"], "cli-val");
	});

	it("returns undefined for missing input without default", () => {
		const step = { id: "s1", type: "bash" as const, command: "echo hi" };
		const workflow = { ...baseWorkflow };
		const result = resolveInputsForStep(workflow, step, null, {});
		assert.deepStrictEqual(result, {});
	});

	it("merges inputs from all scopes correctly", () => {
		const step = {
			id: "s1",
			type: "bash" as const,
			command: "echo hi",
			inputs: [{ name: "step-only", default: "step-val" }],
		} as any;
		const workflow = {
			...baseWorkflow,
			inputs: [{ name: "global-only", default: "global-val" }],
		} as any;
		const controlBlock = {
			id: "cb1",
			type: "loop_until" as const,
			inputs: [{ name: "control-only", default: "control-val" }],
			steps: [],
		} as any;
		const result = resolveInputsForStep(workflow, step, controlBlock, {});
		assert.deepStrictEqual(result, {
			"step-only": "step-val",
			"control-only": "control-val",
			"global-only": "global-val",
		});
	});
});
