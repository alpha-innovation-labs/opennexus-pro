import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Bundled Nexus base system prompt read from system_prompt.md.
 */
export const baseSystemPrompt = readFileSync(
  join(__dirname, "system_prompt.md"),
  "utf-8",
).trimEnd();

