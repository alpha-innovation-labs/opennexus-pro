import assert from "node:assert/strict";
import test from "node:test";
import { sendNotifyMessage } from "../../../../packages/extensions/src/notify/runtime/sendNotifyMessage.js";

test("sendNotifyMessage uses OSC 777 by default and runs the macOS sound hook", () => {
	const writes: string[] = [];
	const spawned: string[] = [];
	sendNotifyMessage("Nexus", "Ready for input", {
		platform: "darwin",
		env: {},
		write: (value) => writes.push(value),
		spawnFn: ((command: string) => ({ unref() { spawned.push(command); } })) as never,
	});
	assert.deepEqual(writes, ["\u001b]777;notify;Nexus;Ready for input\u0007"]);
	assert.deepEqual(spawned, ["afplay /System/Library/Sounds/Submarine.aiff"]);
});

test("sendNotifyMessage uses Kitty OSC 99 inside tmux", () => {
	const writes: string[] = [];
	sendNotifyMessage("Nexus", "Ready for input", {
		platform: "linux",
		env: { KITTY_WINDOW_ID: "1", TMUX: "/tmp/tmux" },
		write: (value) => writes.push(value),
	});
	assert.equal(writes.length, 2);
	assert.match(writes[0] ?? "", /tmux/);
	assert.match(writes[0] ?? "", /\]99;i=1:d=0;Nexus/u);
	assert.match(writes[1] ?? "", /\]99;i=1:p=body;Ready for input/u);
});

test("sendNotifyMessage uses iTerm2 OSC 9 and the override sound command", () => {
	const writes: string[] = [];
	const spawned: string[] = [];
	sendNotifyMessage("Nexus", "Ready for input", {
		platform: "darwin",
		env: { TERM_PROGRAM: "iTerm.app", NEXUS_NOTIFY_SOUND_CMD: "say nexus" },
		write: (value) => writes.push(value),
		spawnFn: ((command: string) => ({ unref() { spawned.push(command); } })) as never,
	});
	assert.deepEqual(writes, ["\u001b]9;Nexus: Ready for input\u0007"]);
	assert.deepEqual(spawned, ["say nexus"]);
});

test("sendNotifyMessage uses Windows toast when WT_SESSION is present", () => {
	const execCalls: Array<{ command: string; args: string[] }> = [];
	sendNotifyMessage("Nexus", "Ready for input", {
		platform: "win32",
		env: { WT_SESSION: "1", NEXUS_NOTIFY_SOUND_CMD: " " },
		execFileFn: ((command: string, args: string[]) => { execCalls.push({ command, args }); return {} as never; }) as never,
	});
	assert.equal(execCalls.length, 1);
	assert.equal(execCalls[0]?.command, "powershell.exe");
	assert.match(execCalls[0]?.args[2] ?? "", /Ready for input/);
});
