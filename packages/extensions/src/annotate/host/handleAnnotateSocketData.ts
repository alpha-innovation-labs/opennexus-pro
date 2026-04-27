import { MAX_SOCKET_BUFFER } from "../constants.js";
import type { AnnotateRuntimeState } from "../runtime/types.js";
import { handleAnnotateMessage } from "./handleAnnotateMessage.js";
import { setAnnotateStatus } from "./setAnnotateStatus.js";

/**
 * Processes streamed socket data from the native host.
 *
 * @param state Annotate runtime state.
 * @param chunk Incoming socket data chunk.
 */
export async function handleAnnotateSocketData(
  state: AnnotateRuntimeState,
  chunk: Buffer,
): Promise<void> {
  state.dataBuffer += chunk.toString();
  if (state.dataBuffer.length > MAX_SOCKET_BUFFER) {
    setAnnotateStatus(state, "Error: Socket buffer overflow");
    state.browserSocket?.destroy();
    state.dataBuffer = "";
    return;
  }

  const lines = state.dataBuffer.split("\n");
  state.dataBuffer = lines.pop() || "";

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    try {
      await handleAnnotateMessage(state, JSON.parse(line));
    } catch {
      setAnnotateStatus(state, "Error: Failed to parse message");
    }
  }
}
