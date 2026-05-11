#!/usr/bin/env node
const fs = require("fs");
const { SOCKET_PATH, TOKEN_PATH } = require("./src/constants.cjs");
const { createLogger } = require("./src/createLogger.cjs");
const { createNativeMessaging } = require("./src/createNativeMessaging.cjs");
const { ensureToken } = require("./src/ensureToken.cjs");
const { pickWorkspaceDirectory } = require("./src/pickWorkspaceDirectory.cjs");
const { redactForLog } = require("./src/redactForLog.cjs");
const { startPiSocketServer } = require("./src/startPiSocketServer.cjs");
const { storeCompletedAnnotation } = require("./src/storeCompletedAnnotation.cjs");

process.umask(0o077);
const log = createLogger();
log("Host starting...");
try { fs.unlinkSync(SOCKET_PATH); } catch {}
const authToken = ensureToken(log);
let piServer = null;

/**
 * Handles one Chrome extension native message.
 *
 * @param {object} msg Message from Chrome extension.
 */
function handleExtensionMessage(msg) {
  log(`From extension: ${redactForLog(msg)}`);
  if (msg?.type === "PING") {
    nativeMessaging.writeMessage({ type: "PONG", timestamp: Date.now() });
    return;
  }
  if (msg?.type === "PICK_WORKSPACE_DIR") {
    pickWorkspaceDirectory(typeof msg.requestId === "number" ? msg.requestId : null, nativeMessaging.writeMessage);
    return;
  }
  storeCompletedAnnotation(msg, log);
  piServer.forwardToPi(msg);
}

const nativeMessaging = createNativeMessaging({ handleMessage: handleExtensionMessage, log });
piServer = startPiSocketServer({ authToken, log, writeMessage: nativeMessaging.writeMessage });
nativeMessaging.start();

/** Cleans up native host runtime files before shutdown. */
function cleanup() {
  try { fs.unlinkSync(SOCKET_PATH); } catch {}
  try { fs.unlinkSync(TOKEN_PATH); } catch {}
  process.exit(0);
}

process.stdin.on("end", () => {
  log("Extension disconnected");
  cleanup();
});
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("uncaughtException", (err) => {
  log(`Uncaught exception: ${err.message}`);
  cleanup();
});
