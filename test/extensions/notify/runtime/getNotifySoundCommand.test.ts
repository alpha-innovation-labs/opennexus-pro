import assert from "node:assert/strict";
import test from "node:test";
import { getNotifySoundCommand } from "../../../../packages/extensions/src/notify/runtime/getNotifySoundCommand.js";

test("getNotifySoundCommand uses the default macOS sound when unset", () => {
	assert.equal(getNotifySoundCommand({}, "darwin"), "afplay /System/Library/Sounds/Submarine.aiff");
});

test("getNotifySoundCommand prefers the Nexus env override", () => {
	assert.equal(getNotifySoundCommand({ NEXUS_NOTIFY_SOUND_CMD: "say done" }, "darwin"), "say done");
});

test("getNotifySoundCommand allows disabling the sound hook with an empty override", () => {
	assert.equal(getNotifySoundCommand({ NEXUS_NOTIFY_SOUND_CMD: "   " }, "darwin"), undefined);
});
