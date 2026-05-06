import { createRequire } from "node:module";
import { resolveInstalledDependencyPath } from "@nexus/runtime/package/resolveInstalledDependencyPath.js";
import { getShellPath } from "./getShellPath.js";
import type { PtyManager } from "../types.js";

const require = createRequire(import.meta.url);
const NODE_PTY_ENTRY_PATH = resolveInstalledDependencyPath(
  import.meta.url,
  "node-pty/lib/index.js",
  "../../../../node_modules/node-pty/lib/index.js",
);

/**
 * Creates the persistent PTY process manager.
 *
 * @returns PTY lifecycle API for the terminal modal.
 */
export function createPtyManager(): PtyManager {
	let pty: any = null;
	let error: string | null = null;
	const dataListeners = new Set<(data: string) => void>();
	const exitListeners = new Set<() => void>();

	return {
		start(cwd: string, cols: number, rows: number): void {
			if (pty) return;
			try {
				const nodePty = require(NODE_PTY_ENTRY_PATH) as typeof import("node-pty");
				pty = nodePty.spawn(getShellPath(), [], {
					name: "xterm-256color",
					cols,
					rows,
					cwd,
					env: process.env as Record<string, string>,
				});
				pty.onData((data: string) => {
					for (const listener of dataListeners) listener(data);
				});
				pty.onExit(() => {
					pty = null;
					for (const listener of exitListeners) listener();
				});
				error = null;
			} catch (cause) {
				error = cause instanceof Error ? cause.message : String(cause);
			}
		},
		write(data: string): void {
			pty?.write(data);
		},
		resize(cols: number, rows: number): void {
			try {
				pty?.resize(cols, rows);
			} catch {
				// Ignore transient resize failures while the shell redraws.
			}
		},
		kill(): void {
			try {
				pty?.kill();
			} catch {
				// Ignore PTY kill failures during teardown.
			}
			pty = null;
		},
		onData(cb: (data: string) => void): () => void {
			dataListeners.add(cb);
			return () => dataListeners.delete(cb);
		},
		onExit(cb: () => void): () => void {
			exitListeners.add(cb);
			return () => exitListeners.delete(cb);
		},
		clearError(): void {
			error = null;
		},
		isRunning(): boolean {
			return pty !== null;
		},
		error(): string | null {
			return error;
		},
		pid(): number | null {
			return pty?.pid ?? null;
		},
	};
}
