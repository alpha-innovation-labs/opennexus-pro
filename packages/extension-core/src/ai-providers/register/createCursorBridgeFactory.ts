import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";

interface CursorBridgeOptions {
	accessToken: string;
	rpcPath: string;
	url?: string;
	unary?: boolean;
}

interface CursorBridgeHandle {
	proc: ChildProcess;
	readonly alive: boolean;
	write(data: Uint8Array): void;
	end(): void;
	onData(cb: (chunk: Buffer) => void): void;
	onClose(cb: (code: number) => void): void;
}

/**
 * Encodes one length-prefixed bridge message.
 *
 * @param data Raw message bytes.
 * @returns Length-prefixed message bytes.
 */
function lpEncode(data: Uint8Array): Buffer {
	const buffer = Buffer.alloc(4 + data.length);
	buffer.writeUInt32BE(data.length, 0);
	buffer.set(data, 4);
	return buffer;
}

/**
 * Creates a Cursor bridge factory backed by a real filesystem bridge script.
 *
 * @param bridgePath Path to pi-cursor-provider's h2-bridge.mjs asset.
 * @returns Bridge factory compatible with pi-cursor-provider.
 */
export function createCursorBridgeFactory(bridgePath: string): (options: CursorBridgeOptions) => CursorBridgeHandle {
	return (options: CursorBridgeOptions): CursorBridgeHandle => {
		const proc = spawn("node", [bridgePath], { stdio: ["pipe", "pipe", "ignore"] });
		const config = JSON.stringify({
			accessToken: options.accessToken,
			url: options.url ?? "https://api2.cursor.sh",
			path: options.rpcPath,
			unary: options.unary ?? false,
		});
		proc.stdin?.write(lpEncode(new TextEncoder().encode(config)));

		let exited = false;
		let exitCode = 1;
		let onDataCallback: ((chunk: Buffer) => void) | undefined;
		let onCloseCallback: ((code: number) => void) | undefined;
		let pending = Buffer.alloc(0);

		proc.stdout?.on("data", (chunk: Buffer) => {
			pending = Buffer.concat([pending, chunk]);
			while (pending.length >= 4) {
				const length = pending.readUInt32BE(0);
				if (pending.length < 4 + length) break;
				onDataCallback?.(pending.subarray(4, 4 + length));
				pending = pending.subarray(4 + length);
			}
		});
		proc.on("exit", (code) => {
			exited = true;
			exitCode = code ?? 1;
			onCloseCallback?.(exitCode);
		});

		return {
			proc,
			get alive() { return !exited; },
			write(data: Uint8Array): void { proc.stdin?.write(lpEncode(data)); },
			end(): void {
				proc.stdin?.write(lpEncode(new Uint8Array(0)));
				proc.stdin?.end();
			},
			onData(cb: (chunk: Buffer) => void): void { onDataCallback = cb; },
			onClose(cb: (code: number) => void): void {
				if (exited) queueMicrotask(() => cb(exitCode));
				else onCloseCallback = cb;
			},
		};
	};
}
