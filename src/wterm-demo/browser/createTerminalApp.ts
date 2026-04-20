import { WTerm } from "@wterm/dom";
import "@wterm/dom/css";
import { createTerminalSocket } from "../socket/createTerminalSocket.js";
import { renderDisconnectedNotice } from "../ui/renderDisconnectedNotice.js";

/**
 * Boots the browser terminal and wires it to the backend PTY socket.
 */
export async function createTerminalApp(): Promise<void> {
  const container = document.getElementById("terminal");

  if (!(container instanceof HTMLElement)) {
    throw new Error("Missing #terminal container");
  }

  const term = new WTerm(container, {
    cols: 120,
    rows: 32,
    autoResize: true,
  });

  await term.init();

  const socket = createTerminalSocket({
    onData(data) {
      term.write(data);
    },
    onExit(code) {
      renderDisconnectedNotice(term, `\r\n\x1b[33mProcess exited with code ${code}\x1b[0m\r\n`);
    },
    onClose() {
      renderDisconnectedNotice(term, "\r\n\x1b[31mSocket disconnected\x1b[0m\r\n");
    },
  });

  term.onData = (data: string) => {
    socket.sendInput(data);
  };

  term.onResize = (cols: number, rows: number) => {
    socket.sendResize(cols, rows);
  };
}
