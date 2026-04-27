declare module "@wterm/dom/css";

declare module "../../../node_modules/@mariozechner/pi-coding-agent/dist/*";
declare module "../../../node_modules/@mariozechner/pi-tui/dist/*";

declare module "ws" {
  export class WebSocketServer {
    constructor(options?: unknown);
    handleUpgrade(request: unknown, socket: unknown, head: unknown, callback: (ws: WebSocket) => void): void;
    close(): void;
  }
  export class WebSocket {
    send(data: string): void;
    close(): void;
    on(event: "message", listener: (raw: unknown) => void): void;
    on(event: "close", listener: () => void): void;
  }
}
