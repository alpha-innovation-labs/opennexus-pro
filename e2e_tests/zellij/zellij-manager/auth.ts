/**
 * auth.ts — Full auth flow orchestration.
 *
 * Orchestrates the complete authentication sequence:
 * 1. Create an auth token via zellij web --create-token
 * 2. Open the zellij web client page
 * 3. Snapshot the page and discover refs
 * 4. Fill the security token text box
 * 5. Click the AUTHENTICATE button
 * 6. Wait for the authenticated session page
 * 7. Take a final screenshot
 * 8. Close the browser session
 *
 * This is the core "one-shot auth" command that replaces the entire
 * bash automation script.
 */

import { createToken } from "./port";
import { browserOpen, browserScreenshot, browserSnapshot, browserFill, browserClick, browserWait, browserClose, SnapshotResult } from "./browser";

/**
 * Run the full authentication flow.
 *
 * @param session — Zellij session name (used in the URL).
 * @param port — Zellij web server port (default: 8082).
 * @param screenshotPath — Output path for the final screenshot.
 * @returns The token used for authentication.
 */
export function authFlow(
  session: string,
  port: number = 8082,
  screenshotPath: string = "./zellij-authenticated.png",
): string {
  console.log("=== Starting auth flow ===");
  console.log(`  Session: ${session}`);
  console.log(`  Port: ${port}`);
  console.log(`  Screenshot: ${screenshotPath}`);

  // Step 1: Create an auth token.
  const token = createToken();
  console.log(`  Token: ${token}`);

  // Step 2: Open the zellij web client page.
  const url = `http://127.0.0.1:${port}/${session}`;
  browserOpen(url);

  // Step 3: Snapshot the page and discover refs.
  const snapshot: SnapshotResult = browserSnapshot(true);

  // Parse refs from snapshot output dynamically.
  const inputRef = snapshot.raw.match(/textbox.*?ref=(e\d+)/i)?.[1];
  const buttonRef = snapshot.raw.match(/AUTHENTICATE.*?ref=(e\d+)/i)?.[1];

  if (!inputRef || !buttonRef) {
    console.error("ERROR: Could not find refs in snapshot. Output was:");
    console.error(snapshot.raw);
    process.exit(1);
  }

  console.log(`  Discovered refs — input: @${inputRef}, button: @${buttonRef}`);

  // Step 4: Fill the security token text box.
  browserFill(`@${inputRef}`, token);

  // Step 5: Click the AUTHENTICATE button.
  browserClick(`@${buttonRef}`);

  // Step 6: Wait for the authenticated session page to fully load.
  browserWait("--load networkidle");

  // Step 7: Take the final screenshot.
  browserScreenshot(screenshotPath);
  console.log(`  Screenshot saved to ${screenshotPath}`);

  // Step 8: Close the browser session.
  browserClose();

  console.log("=== Auth flow complete ===");
  return token;
}
