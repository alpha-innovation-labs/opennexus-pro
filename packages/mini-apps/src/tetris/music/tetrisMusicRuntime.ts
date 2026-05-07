import type { ChildProcess } from "node:child_process";
import { registerTetrisMusicShutdown } from "./registerTetrisMusicShutdown.js";
import { startTetrisMusic } from "./startTetrisMusic.js";
import { stopTetrisMusic } from "./stopTetrisMusic.js";

let musicProcess: ChildProcess | null = null;
let paused = false;

/**
 * Returns whether the shared Tetris music process is actively playing.
 *
 * @returns True when music is running and not paused.
 */
export function isTetrisMusicRunning(): boolean {
	return musicProcess !== null && !paused;
}

/** Starts or resumes the shared Tetris music process if needed. */
export function ensureTetrisMusicRunning(): void {
	if (musicProcess) {
		resumeTetrisMusicRuntime();
		return;
	}
	registerTetrisMusicShutdown();
	musicProcess = startTetrisMusic();
	paused = false;
}

/** Pauses the shared Tetris music process without losing playback position. */
export function pauseTetrisMusicRuntime(): void {
	if (!musicProcess?.pid || paused) return;
	try {
		process.kill(-musicProcess.pid, "SIGSTOP");
		paused = true;
	} catch {
		paused = false;
	}
}

/** Resumes the shared Tetris music process from its paused position. */
export function resumeTetrisMusicRuntime(): void {
	if (!musicProcess?.pid || !paused) return;
	try {
		process.kill(-musicProcess.pid, "SIGCONT");
		paused = false;
	} catch {
		musicProcess = null;
		paused = false;
	}
}

/** Stops the shared Tetris music process. */
export function stopTetrisMusicRuntime(): void {
	stopTetrisMusic(musicProcess);
	musicProcess = null;
	paused = false;
}
