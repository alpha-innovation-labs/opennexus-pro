export interface TerminalSocketOptions {
  onData: (data: string) => void;
  onExit: (code: number) => void;
  onClose: () => void;
}

interface ServerMessage {
  type: "data" | "exit";
  data?: string;
  code?: number;
}

/**
 * Creates the browser WebSocket client used by the wterm e2e.
 */
export function createTerminalSocket(
  options: TerminalSocketOptions,
): {
  sendInput: (data: string) => void;
  sendResize: (cols: number, rows: number) => void;
} {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${window.location.host}/terminal`);
  const pendingMessages: string[] = [];

  socket.addEventListener("open", () => {
    for (const message of pendingMessages.splice(0)) {
      socket.send(message);
    }
  });

  socket.addEventListener("message", (event: MessageEvent<string>) => {
    const message = JSON.parse(event.data) as ServerMessage;

    if (message.type === "data" && typeof message.data === "string") {
      options.onData(message.data);
      return;
    }

    if (message.type === "exit") {
      options.onExit(message.code ?? 0);
    }
  });

  socket.addEventListener("close", () => {
    options.onClose();
  });

  return {
    sendInput(data: string): void {
      const message = JSON.stringify({ type: "input", data });
      if (socket.readyState === WebSocket.OPEN) socket.send(message);
      else pendingMessages.push(message);
    },
    sendResize(cols: number, rows: number): void {
      const message = JSON.stringify({ type: "resize", cols, rows });
      if (socket.readyState === WebSocket.OPEN) socket.send(message);
      else pendingMessages.push(message);
    },
  };
}
