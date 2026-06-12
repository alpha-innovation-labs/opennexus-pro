/**
 * browser.ts — Wrap agent-browser calls.
 *
 * Invokes `agent-browser` CLI via child_process.execSync() and
 * parses results (e.g., ref discovery from snapshot output).
 * agent-browser is NOT replaced — it is invoked as a dependency.
 */

import { execSync } from "node:child_process";

/**
 * Result of a browser snapshot command.
 */
export interface SnapshotResult {
  /** Raw stdout from `agent-browser snapshot`. */
  raw: string;
  /** Interactive element refs discovered (e.g., "@e1", "@e2"). */
  refs: string[];
}

/**
 * Open a URL in the browser.
 *
 * @param url — URL to navigate to.
 * @returns stdout from `agent-browser open`.
 */
export function browserOpen(url: string): string {
  console.log(`[browser] Opening: ${url}`);
  return execSync(`agent-browser open "${url}"`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/**
 * Take an accessibility tree snapshot of the current page.
 * Uses `-i` (interactive elements only) by default for ref discovery.
 *
 * @param interactiveOnly — If true, uses `-i` flag (default: true).
 * @returns SnapshotResult with raw output and discovered refs.
 */
export function browserSnapshot(interactiveOnly: boolean = true): SnapshotResult {
  const flag = interactiveOnly ? "-i" : "";
  const cmd = `agent-browser snapshot ${flag}`.trim();

  console.log(`[browser] Snapshot${interactiveOnly ? " (interactive)" : ""}...`);
  const raw = execSync(cmd, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  // Parse refs from snapshot output.
  // Format includes "ref=e1", "ref=e2", etc.
  const refs = raw.match(/ref=(e\d+)/g)?.map((m) => `@${m}`) || [];

  return { raw, refs };
}

/**
 * Fill an input field by ref.
 *
 * @param ref — Element ref (e.g., "@e1").
 * @param value — Text value to fill.
 */
export function browserFill(ref: string, value: string): void {
  console.log(`[browser] Fill ${ref}: "${value}"`);
  execSync(`agent-browser fill "${ref}" "${value}"`, {
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/**
 * Click an element by ref.
 *
 * @param ref — Element ref (e.g., "@e3").
 */
export function browserClick(ref: string): void {
  console.log(`[browser] Click ${ref}`);
  execSync(`agent-browser click "${ref}"`, {
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/**
 * Wait for page navigation or element.
 *
 * @param opts — Wait options (e.g., "--load networkidle").
 */
export function browserWait(opts: string = ""): void {
  const cmd = `agent-browser wait ${opts}`.trim();
  console.log(`[browser] Wait ${opts || "(default)"}`);
  execSync(cmd, { stdio: ["pipe", "pipe", "pipe"] });
}

/**
 * Save a screenshot to a file.
 *
 * @param outputPath — File path to save the screenshot.
 */
export function browserScreenshot(outputPath: string): void {
  console.log(`[browser] Screenshot → ${outputPath}`);
  execSync(`agent-browser screenshot "${outputPath}"`, {
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/**
 * Close the browser session.
 */
export function browserClose(): void {
  console.log("[browser] Closing browser session...");
  execSync("agent-browser close", {
    stdio: ["pipe", "pipe", "pipe"],
  });
}
