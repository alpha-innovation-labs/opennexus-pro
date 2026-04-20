import assert from "node:assert/strict";
import test from "node:test";
import * as os from "node:os";
import * as path from "node:path";
import { expandTilde } from "../../../src/extensions/sub-agents/extension/path/expandTilde.js";

test("expandTilde expands a leading home path", () => {
	assert.equal(expandTilde("~/demo/file.txt"), path.join(os.homedir(), "demo/file.txt"));
	assert.equal(expandTilde("/tmp/demo.txt"), "/tmp/demo.txt");
});
