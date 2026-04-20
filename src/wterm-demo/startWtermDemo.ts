import { startDemoServer } from "./server/startDemoServer.js";

/**
 * Starts the local browser-hosted Nexus demo.
 */
async function main(): Promise<void> {
  await startDemoServer();
}

void main();
