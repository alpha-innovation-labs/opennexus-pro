import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SubagentContextProvider } from "./types.js";

/**
 * Reads one text file when present.
 *
 * @param filePath Absolute file path.
 * @returns File text or empty string.
 */
function readOptionalText(filePath: string): string {
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8").trim();
}

/**
 * Builds a compact top-level entry list for the current project.
 *
 * @param cwd Project root.
 * @returns Directory summary lines.
 */
function listProjectEntries(cwd: string): string[] {
  return readdirSync(cwd, { withFileTypes: true })
    .filter((entry) => ![".git", "node_modules"].includes(entry.name))
    .slice(0, 20)
    .map((entry) => `${entry.isDirectory() ? "dir" : "file"}: ${entry.name}`);
}

/**
 * Builds one project-context provider from the current working directory.
 *
 * @returns Context provider.
 */
export function createProjectContextProvider(): SubagentContextProvider {
  return {
    id: "project-context",
    async provide({ ctx }) {
      const packageJsonText = readOptionalText(join(ctx.cwd, "package.json"));
      const readmeText = readOptionalText(join(ctx.cwd, "README.md"));
      const sections = [
        "# Project Context",
        `cwd: ${ctx.cwd}`,
        "",
        "## Top-level Entries",
        ...listProjectEntries(ctx.cwd),
      ];

      if (packageJsonText) {
        sections.push("", "## package.json", packageJsonText.slice(0, 4000));
      }
      if (readmeText) {
        sections.push("", "## README.md", readmeText.slice(0, 4000));
      }

      return sections.join("\n").trim();
    },
  };
}
