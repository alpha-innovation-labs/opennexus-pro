import assert from "node:assert/strict";
import test from "node:test";
import { createForkLeaves } from "../../../packages/extensions/src/slash-menu/createForkLeaves.js";

test("fork leaves render the message summary directly after the fork number", () => {
	const leaves = createForkLeaves([
		{
			id: "entry-1",
			type: "message",
			message: {
				role: "user",
				content: "First fork prompt should sit beside the number",
			},
		},
	]);

	assert.equal(leaves[0]?.label, "#1 First fork prompt should sit beside the number");
	assert.equal(leaves[0]?.description, "");
});
