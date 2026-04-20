import { createTerminalApp } from "./createTerminalApp.js";

/**
 * Starts the browser-side wterm demo.
 */
async function main(): Promise<void> {
  await createTerminalApp();
}

void main();
