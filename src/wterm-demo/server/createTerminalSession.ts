import type { DemoPty } from "../pty/types.js";
import { createDemoPty } from "./createDemoPty.js";

const MAX_BUFFER_LENGTH = 200000;

/**
 * Creates the shared PTY session and keeps a replay buffer for new clients.
 */
export function createTerminalSession(): {
  ptyProcess: DemoPty;
  getBuffer: () => string;
  appendListener: (listener: (data: string) => void) => () => void;
  onExit: (listener: (code: number) => void) => () => void;
} {
  const ptyProcess = createDemoPty();
  const listeners = new Set<(data: string) => void>();
  const exitListeners = new Set<(code: number) => void>();
  let buffer = "";

  ptyProcess.onData((data: string) => {
    buffer = `${buffer}${data}`.slice(-MAX_BUFFER_LENGTH);
    for (const listener of listeners) listener(data);
  });

  ptyProcess.onExit((exitCode: number) => {
    for (const listener of exitListeners) listener(exitCode);
  });

  return {
    ptyProcess,
    getBuffer(): string {
      return buffer;
    },
    appendListener(listener: (data: string) => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    onExit(listener: (code: number) => void): () => void {
      exitListeners.add(listener);
      return () => exitListeners.delete(listener);
    },
  };
}
