import * as fs from "node:fs";
import * as net from "node:net";
import { SOCKET_PATH, TOKEN_PATH } from "../constants.js";
import type { AnnotateRuntimeState } from "../runtime/types.js";
import { handleAnnotateSocketClose } from "./handleAnnotateSocketClose.js";
import { handleAnnotateSocketData } from "./handleAnnotateSocketData.js";
import { sendToHost } from "./sendToHost.js";
import { setAnnotateStatus } from "./setAnnotateStatus.js";

/**
 * Connects the Pi extension to the native host socket.
 *
 * @param state Annotate runtime state.
 */
export function connectToAnnotateHost(state: AnnotateRuntimeState): Promise<void> {
  return new Promise((resolve, reject) => {
    if (state.browserSocket && !state.browserSocket.destroyed) {
      resolve();
      return;
    }

    let settled = false;

    try {
      state.authToken = fs.readFileSync(TOKEN_PATH, "utf8").trim();
    } catch {
      reject(new Error("Missing auth token; is the native host running?"));
      return;
    }

    const browserSocket = net.createConnection(SOCKET_PATH);
    state.browserSocket = browserSocket;

    browserSocket.on("connect", () => {
      if (!settled) {
        settled = true;
        resolve();
      }
      setAnnotateStatus(state, "Connected to native host");
      sendToHost(state, { type: "AUTH", token: state.authToken });
    });

    browserSocket.on("data", (data: Buffer) => {
      void handleAnnotateSocketData(state, data);
    });

    browserSocket.on("error", (error) => {
      setAnnotateStatus(state, `Error: ${error.message}`);
      if (!settled) {
        settled = true;
        reject(error);
      }
    });

    browserSocket.on("close", () => {
      void handleAnnotateSocketClose(state);
    });
  });
}
