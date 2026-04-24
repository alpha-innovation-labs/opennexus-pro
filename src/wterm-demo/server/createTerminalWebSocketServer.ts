import type { Server } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { createTerminalSession } from "./createTerminalSession.js";

interface ClientMessage {
  type: "input" | "resize";
  data?: string;
  cols?: number;
  rows?: number;
}

/**
 * Attaches the terminal WebSocket bridge to the HTTP server.
 */
export function createTerminalWebSocketServer(server: Server): {
  dispose: () => void;
} {
  const session = createTerminalSession();
  const sockets = new Set<WebSocket>();
  const wss = new WebSocketServer({ noServer: true });

  const removeDataListener = session.appendListener((data: string) => {
    const payload = JSON.stringify({ type: "data", data });
    for (const socket of sockets) socket.send(payload);
  });

  const removeExitListener = session.onExit((code: number) => {
    const payload = JSON.stringify({ type: "exit", code });
    for (const socket of sockets) socket.send(payload);
  });

  server.on("upgrade", (request, socket, head) => {
    if (request.url !== "/terminal") {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      sockets.add(ws);
      ws.send(JSON.stringify({ type: "data", data: session.getBuffer() }));

      ws.on("message", (raw: unknown) => {
        const message = JSON.parse(String(raw)) as ClientMessage;

        if (message.type === "input" && typeof message.data === "string") {
          session.ptyProcess.write(message.data);
          return;
        }

        if (
          message.type === "resize" &&
          typeof message.cols === "number" &&
          typeof message.rows === "number"
        ) {
          session.ptyProcess.resize(message.cols, message.rows);
        }
      });

      ws.on("close", () => {
        sockets.delete(ws);
      });
    });
  });

  return {
    dispose(): void {
      removeDataListener();
      removeExitListener();
      for (const socket of sockets) socket.close();
      wss.close();
      session.ptyProcess.kill();
    },
  };
}
