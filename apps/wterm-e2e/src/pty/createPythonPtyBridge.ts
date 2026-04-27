import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import type { E2ePty } from "./types.js";
import { getPtyBridgeScriptPath } from "./getPtyBridgeScriptPath.js";

interface BridgeMessage {
  type: "data" | "exit";
  data?: string;
  code?: number;
}

interface BridgeOptions {
  shell: string;
  command: string;
  cwd: string;
  cols: number;
  rows: number;
}

/**
 * Starts a Python PTY bridge process that proxies terminal IO over stdio.
 */
export function createPythonPtyBridge(options: BridgeOptions): E2ePty {
  const processHandle = spawn(
    "python3",
    [
      getPtyBridgeScriptPath(),
      options.shell,
      options.command,
      options.cwd,
      String(options.cols),
      String(options.rows),
    ],
    { stdio: ["pipe", "pipe", "inherit"] },
  );
  const dataListeners = new Set<(data: string) => void>();
  const exitListeners = new Set<(code: number) => void>();
  const reader = createInterface({ input: processHandle.stdout! });
  let didExit = false;

  reader.on("line", (line: string) => {
    const message = JSON.parse(line) as BridgeMessage;

    if (message.type === "data" && typeof message.data === "string") {
      const data = Buffer.from(message.data, "base64").toString("utf8");
      for (const listener of dataListeners) listener(data);
      return;
    }

    if (message.type === "exit") {
      didExit = true;
      for (const listener of exitListeners) listener(message.code ?? 0);
    }
  });

  processHandle.on("exit", (code) => {
    if (didExit) return;
    didExit = true;
    for (const listener of exitListeners) listener(code ?? 0);
  });

  return {
    write(data: string): void {
      processHandle.stdin?.write(
        `${JSON.stringify({ type: "input", data: Buffer.from(data).toString("base64") })}\n`,
      );
    },
    resize(cols: number, rows: number): void {
      processHandle.stdin?.write(`${JSON.stringify({ type: "resize", cols, rows })}\n`);
    },
    kill(): void {
      reader.close();
      processHandle.kill("SIGTERM");
    },
    onData(listener: (data: string) => void): () => void {
      dataListeners.add(listener);
      return () => dataListeners.delete(listener);
    },
    onExit(listener: (code: number) => void): () => void {
      exitListeners.add(listener);
      return () => exitListeners.delete(listener);
    },
  };
}
