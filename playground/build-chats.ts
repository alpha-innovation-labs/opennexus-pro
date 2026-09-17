/**
 * build-chats.ts — Build chats.json from pi and nexus agent session files.
 *
 * Usage:
 *   npx tsx playground/build-chats.ts [--output <path>] [--source pi|nexus|all]
 *
 * Structure:
 *   Level 1: folder (directory path)
 *   Level 2: conversation (array of user message strings)
 *   Level 3: individual user message (string)
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, abspath } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

// --- Types ----------------------------------------------------------------

interface ContentBlock {
  type?: string;
  text?: string;
}

interface SessionMessage {
  role?: string;
  content?: string | ContentBlock[];
}

interface JsonlLine {
  type?: string;
  cwd?: string;
  message?: SessionMessage;
  [key: string]: unknown;
}

interface FolderEntry {
  folder: string;
  conversations: string[][];
}

interface Output {
  total_folders: number;
  total_conversations: number;
  chats: FolderEntry[];
}

// --- Helpers ---------------------------------------------------------------

function extractUserMessages(filePath: string): string[] {
  const messages: string[] = [];
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    return messages;
  }

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let obj: JsonlLine;
    try {
      obj = JSON.parse(trimmed) as JsonlLine;
    } catch {
      continue;
    }

    if (obj.type !== "message") continue;
    const msg = obj.message;
    if (!msg || msg.role !== "user") continue;

    let content: string = "";
    if (typeof msg.content === "string") {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      content = msg.content
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text!)
        .join("\n");
    }

    if (content) messages.push(content);
  }

  return messages;
}

/**
 * Read a session directory and group user messages by cwd.
 * Returns a Map of cwd -> conversations (each conversation is a string[]).
 */
function processSource(sessionsRoot: string): Map<string, string[][]> {
  const result = new Map<string, string[][]>();

  if (!existsSync(sessionsRoot)) return result;

  let subdirs: string[];
  try {
    subdirs = readdirSync(sessionsRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return result;
  }

  for (const subdir of subdirs) {
    const subdirPath = join(sessionsRoot, subdir);
    let files: string[];
    try {
      files = readdirSync(subdirPath)
        .filter((f) => f.endsWith(".jsonl"))
        .sort();
    } catch {
      continue;
    }

    for (const file of files) {
      const filePath = join(subdirPath, file);

      // Read first line to get cwd
      let cwd = "";
      try {
        const raw = readFileSync(filePath, "utf-8");
        const firstLine = raw.split("\n").find((l) => l.trim());
        if (firstLine) {
          const meta = JSON.parse(firstLine) as JsonlLine;
          if (meta.type === "session" && meta.cwd) cwd = meta.cwd;
        }
      } catch {
        continue;
      }
      if (!cwd) continue;

      const userMsgs = extractUserMessages(filePath);
      if (userMsgs.length === 0) continue;

      const existing = result.get(cwd) ?? [];
      existing.push(userMsgs);
      result.set(cwd, existing);
    }
  }

  return result;
}

// --- CLI -------------------------------------------------------------------

function parseArgs(): { output: string; source: "pi" | "nexus" | "all" } {
  const args = process.argv.slice(2);
  let output = join(dirname(fileURLToPath(import.meta.url)), "chats.json");
  let source: "pi" | "nexus" | "all" = "all";

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === "--output" || a === "-o") && args[i + 1]) {
      output = args[++i];
    } else if ((a === "--source" || a === "-s") && args[i + 1]) {
      const v = args[++i];
      if (v === "pi" || v === "nexus" || v === "all") source = v;
    }
  }

  return { output, source };
}

// --- Main ------------------------------------------------------------------

function main(): void {
  const { output, source } = parseArgs();

  const sources: string[] = [];
  if (source === "pi" || source === "all") {
    sources.push(join(homedir(), ".pi/agent/sessions"));
  }
  if (source === "nexus" || source === "all") {
    sources.push(join(homedir(), ".local/share/nexus/agent/sessions"));
  }

  const merged = new Map<string, string[][]>();

  for (const root of sources) {
    process.stderr.write(`Processing ${root}...\n`);
    const data = processSource(root);
    for (const [cwd, conversations] of data) {
      const existing = merged.get(cwd) ?? [];
      merged.set(cwd, [...existing, ...conversations]);
    }
  }

  const chats: FolderEntry[] = [...merged.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folder, conversations]) => ({
      folder,
      // Sort conversations by message count (ascending)
      conversations: [...conversations].sort((a, b) => a.length - b.length),
    }));

  const result: Output = {
    total_folders: chats.length,
    total_conversations: chats.reduce((sum, c) => sum + c.conversations.length, 0),
    chats,
  };

  const outDir = dirname(output);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(output, JSON.stringify(result, null, 2));

  process.stderr.write(
    `Done: ${chats.length} folders, ${result.total_conversations} conversations → ${output}\n`,
  );
}

main();
