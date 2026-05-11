const fs = require("fs");
const net = require("net");
const { MAX_SOCKET_BUFFER, SOCKET_PATH } = require("./constants.cjs");
const { redactForLog } = require("./redactForLog.cjs");

/**
 * Starts the Unix socket server used by the Nexus TUI process.
 *
 * @param {{authToken: string|null, log: (message: string) => void, writeMessage: (message: object) => void}} options Server dependencies.
 * @returns {{server: import('net').Server, forwardToPi: (message: object) => void}} Server controls.
 */
function startPiSocketServer(options) {
  let piSocket = null;
  let piAuthed = false;
  const server = net.createServer((socket) => {
    options.log("Pi client connected");
    if (piSocket && !piSocket.destroyed) replaceExistingClient({ piSocket, piAuthed, log: options.log });
    piSocket = socket;
    piAuthed = false;
    let buffer = "";
    socket.on("data", (data) => {
      buffer += data.toString();
      if (buffer.length > MAX_SOCKET_BUFFER) {
        options.log("Pi socket buffer overflow, closing connection");
        socket.destroy();
        buffer = "";
        return;
      }
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const result = handlePiLine({ line, socket, authToken: options.authToken, piAuthed, log: options.log, writeMessage: options.writeMessage });
        piAuthed = result.piAuthed;
      }
    });
    socket.on("close", () => {
      options.log("Pi client disconnected");
      if (piSocket === socket) {
        piSocket = null;
        piAuthed = false;
      }
    });
    socket.on("error", (error) => options.log(`Socket error: ${error.message}`));
  });
  server.listen(SOCKET_PATH, () => {
    options.log(`Listening on ${SOCKET_PATH}`);
    try { fs.chmodSync(SOCKET_PATH, 0o600); } catch {}
  });
  return { server, forwardToPi: (message) => forwardToPi({ message, piSocket, log: options.log }) };
}

/**
 * Replaces an existing connected Nexus client.
 *
 * @param {{piSocket: import('net').Socket, piAuthed: boolean, log: (message: string) => void}} options Client state.
 */
function replaceExistingClient(options) {
  if (options.piAuthed) {
    options.log("Replacing existing authenticated Pi client");
    try {
      options.piSocket.write(JSON.stringify({ type: "SESSION_REPLACED", reason: "Another terminal started annotation" }) + "\n");
    } catch (error) {
      options.log(`Error notifying old client: ${error.message}`);
    }
  } else {
    options.log("Replacing existing unauthenticated Pi client");
  }
  options.piSocket.destroy();
}

/**
 * Handles one newline-delimited Nexus socket message.
 *
 * @param {{line: string, socket: import('net').Socket, authToken: string|null, piAuthed: boolean, log: (message: string) => void, writeMessage: (message: object) => void}} options Message input.
 * @returns {{piAuthed: boolean}} Updated auth state.
 */
function handlePiLine(options) {
  try {
    const msg = JSON.parse(options.line);
    if (!options.piAuthed) return authenticatePiClient({ ...options, msg });
    options.log(`From Pi: ${redactForLog(msg)}`);
    options.writeMessage(msg);
  } catch (error) {
    options.log(`Pi parse error: ${error.message}`);
  }
  return { piAuthed: options.piAuthed };
}

/**
 * Authenticates an initial Nexus socket message.
 *
 * @param {{msg: object, socket: import('net').Socket, authToken: string|null, log: (message: string) => void}} options Auth input.
 * @returns {{piAuthed: boolean}} Updated auth state.
 */
function authenticatePiClient(options) {
  if (options.msg?.type === "AUTH" && options.authToken && options.msg.token === options.authToken) {
    options.log("Pi client authenticated");
    return { piAuthed: true };
  }
  options.log("Pi client authentication failed");
  options.socket.destroy();
  return { piAuthed: false };
}

/**
 * Forwards an extension message to the active Nexus socket client.
 *
 * @param {{message: object, piSocket: import('net').Socket|null, log: (message: string) => void}} options Forwarding input.
 */
function forwardToPi(options) {
  if (options.piSocket && !options.piSocket.destroyed) {
    options.piSocket.write(JSON.stringify(options.message) + "\n");
    return;
  }
  options.log("No pi client connected, message captured by annotations daemon when available");
}

module.exports = { startPiSocketServer };
