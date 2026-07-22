import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const STATE_FILE = path.join(getAgentDirPath(), "last-msg.json");

/**
 * Reads the current pane ID from `herdr pane current --current`.
 * Returns undefined if the CLI is unavailable or not running inside Herdr.
 */
function getCurrentPaneId(): string | undefined {
  const result = spawnSync("herdr", ["pane", "current", "--current"], {
    encoding: "utf-8",
    timeout: 5000,
  });

  if (result.error || result.status !== 0) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(result.stdout);
    return parsed?.result?.pane?.pane_id;
  } catch {
    return undefined;
  }
}

/**
 * Reads the last assistant message from agent_end event data.
 * Scans messages array for the last entry with role === "assistant".
 */
function lastAssistantMessage(messages: unknown[]): any | undefined {
  const arr = Array.isArray(messages) ? messages : [];
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const msg = arr[i] as any;
    if (msg?.role === "assistant") {
      return msg;
    }
  }
  return undefined;
}

/**
 * Extracts a human-readable string from an assistant message.
 * Prefers content (text or string array), falls back to JSON stringification.
 */
function extractAssistantContent(msg: any): string | undefined {
  if (!msg) return undefined;

  const content = msg.content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const textParts = content
      .filter((part: any) => typeof part?.text === "string")
      .map((part: any) => part.text);
    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  return undefined;
}

/**
 * Reads the state file, parses it, adds/updates the pane entry, and writes it back.
 * Creates parent directories if they don't exist.
 */
function writeState(paneId: string, assistantMsg: string): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });

  let data: Record<string, string> = {};
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    data = JSON.parse(raw);
  } catch {
    // File doesn't exist or is invalid — start fresh
    data = {};
  }

  data[paneId] = assistantMsg;

  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Registers the Herdr agent-end-log extension.
 *
 * When running inside a Herdr-managed pane (HERDR_ENV=1), this extension
 * listens for agent_end events, extracts the last assistant message content,
 * and writes it to a per-pane state file at the Nexus agent directory (`last-msg.json`).
 *
 * @param pi Pi extension API.
 */
export function registerHerdrAgentEndLogExtension(pi: ExtensionAPI): void {
  // Only operate inside a Herdr-managed pane
  if (process.env.HERDR_ENV !== "1") {
    return;
  }

  pi.on("agent_end", (event: any) => {
    const paneId = getCurrentPaneId();
    if (!paneId) {
      return;
    }

    const assistantMsg = lastAssistantMessage(event?.messages);
    const content = extractAssistantContent(assistantMsg);

    if (content) {
      writeState(paneId, content);
    }
  });
}
