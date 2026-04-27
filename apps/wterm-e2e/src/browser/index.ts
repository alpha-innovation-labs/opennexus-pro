import { createTerminalApp } from "./createTerminalApp.js";

/**
 * Starts the browser-side wterm e2e.
 */
async function main(): Promise<void> {
  await createTerminalApp();
}

void main();
