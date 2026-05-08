import assert from "node:assert/strict";
import test from "node:test";
import { buildToolResult } from "../tool/response-envelope.js";
import { applyTaskMutation } from "./state-reducer.js";
import type { TaskState } from "./state.js";

/**
 * Creates a deterministic empty todo reducer state for unit tests.
 */
function emptyState(): TaskState {
	return { tasks: [], nextId: 1 };
}

test("create_many adds multiple pending tasks in one mutation", () => {
	const result = applyTaskMutation(emptyState(), "create_many", {
		items: [
			{ subject: "Inspect todo reducer" },
			{ subject: "Update todo docs", description: "Document bulk operations" },
		],
	});

	assert.equal(result.op.kind, "create_many");
	assert.deepEqual(result.state.tasks.map((task) => task.subject), ["Inspect todo reducer", "Update todo docs"]);
	assert.deepEqual(result.state.tasks.map((task) => task.status), ["pending", "pending"]);
	assert.equal(result.state.nextId, 3);
});

test("delete_many tombstones multiple tasks in one mutation", () => {
	const state: TaskState = {
		nextId: 4,
		tasks: [
			{ id: 1, subject: "Keep task", status: "pending" },
			{ id: 2, subject: "Delete first", status: "pending" },
			{ id: 3, subject: "Delete second", status: "completed" },
		],
	};

	const result = applyTaskMutation(state, "delete_many", { ids: [2, 3] });

	assert.equal(result.op.kind, "delete_many");
	assert.deepEqual(result.state.tasks.map((task) => task.status), ["pending", "deleted", "deleted"]);
	assert.equal(result.state.nextId, 4);
});

test("create_many returns a readable bulk result envelope", () => {
	const result = applyTaskMutation(emptyState(), "create_many", {
		items: [{ subject: "Write bulk tests" }, { subject: "Ship bulk docs" }],
	});

	const envelope = buildToolResult("create_many", { items: [] }, result.state, result.op);

	assert.equal(envelope.content[0]?.text, "Created 2 tasks\n#1: Write bulk tests (pending)\n#2: Ship bulk docs (pending)");
});

test("delete_many validates the full batch before mutating state", () => {
	const state: TaskState = {
		nextId: 3,
		tasks: [
			{ id: 1, subject: "Safe task", status: "pending" },
			{ id: 2, subject: "Already gone", status: "deleted" },
		],
	};

	const result = applyTaskMutation(state, "delete_many", { ids: [1, 2] });

	assert.equal(result.op.kind, "error");
	assert.deepEqual(result.state.tasks, state.tasks);
});
