/**
 * port.ts — Start/stop/status zellij web server.
 *
 * Wraps `zellij web` CLI commands to manage the web server lifecycle.
 * Reads/writes state.json to track port and PID.
 */

import { execSync, spawn } from "node:child_process";
import { readState, writeState, State } from "./state";

/**
 * Result of a port status check.
 */
export interface PortStatus {
  /** Whether the web server is currently online. */
  online: boolean;
  /** The port the server is configured on. */
  port: number;
  /** Raw stdout from `zellij web --status`. */
  output: string;
}

/**
 * Start the zellij web server on the configured port.
 * Refuses to start if the server is already running.
 * Daemonizes the server process so the CLI returns immediately.
 *
 * @param port — Optional port override (defaults to state.port).
 * @returns The PID of the daemonized server process.
 */
export function portStart(port?: number): number {
  const state = readState();
  const targetPort = port ?? state.port;

  // Check if already running first.
  const status = portStatus();
  if (status.online) {
    console.error(
      `ERROR: Web server already running on port ${status.port}. Stop it first with 'port stop'.`,
    );
    process.exit(1);
  }

  console.log(`Starting zellij web server on port ${targetPort}...`);

  // Daemonize: spawn detached, ignore stdio, unref so the CLI can exit.
  const child = spawn("zellij", ["web", "--port", String(targetPort)], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
  });

  const pid = child.pid;
  console.log(`  Server daemonized with PID ${pid}`);

  // Update state with the new port and PID.
  const updated: State = {
    ...state,
    port: targetPort,
    webServerPid: pid,
    updatedAt: new Date().toISOString(),
  };
  writeState(updated);

  // Release the reference so the parent can exit.
  child.unref();

  return pid;
}

/**
 * Stop the zellij web server.
 *
 * @returns The stdout from `zellij web --stop`.
 */
export function portStop(): string {
  const state = readState();
  console.log("Stopping zellij web server...");
  const output = execSync(
    "zellij web --stop",
    { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
  );

  // Clear web server PID from state.
  const updated: State = {
    ...state,
    webServerPid: 0,
    updatedAt: new Date().toISOString(),
  };
  writeState(updated);

  console.log(output.trim());
  return output;
}

/**
 * Get the current web server status.
 *
 * @returns PortStatus with online/offline, port, and raw output.
 */
export function portStatus(): PortStatus {
  const state = readState();
  try {
    const output = execSync(
      "zellij web --status",
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
    );

    // Parse "online" vs "offline" from output.
    const online = output.includes("online");

    // Extract port from "http://127.0.0.1:8082".
    const portMatch = output.match(/:(\d+)\s*$/);
    const port = portMatch ? parseInt(portMatch[1], 10) : state.port;

    return { online, port, output: output.trim() };
  } catch {
    // zellij web --status always exits 0, but just in case.
    return { online: false, port: state.port, output: "offline" };
  }
}

/**
 * Create an auth token and update state with the result.
 *
 * @returns The extracted token string (UUID).
 */
export function createToken(): string {
  const state = readState();
  const output = execSync(
    "zellij web --create-token",
    { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
  );

  // Parse token from output format:
  // "Created token successfully\n\n token_18: 698c77e7-b03c-45d7-a63f-5e4401118d05"
  const tokenMatch = output.match(/token_\d+:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
  if (!tokenMatch) {
    console.error(`ERROR: Failed to extract token from zellij output:\n${output}`);
    process.exit(1);
  }

  const token = tokenMatch[1];

  // Update state with the new token.
  const updated: State = {
    ...state,
    lastToken: token,
    updatedAt: new Date().toISOString(),
  };
  writeState(updated);

  return token;
}

/**
 * Show the currently stored token from state (if any).
 *
 * @returns The lastToken from state, or empty string if none.
 */
export function showToken(): string {
  const state = readState();
  const token = state.lastToken;
  if (token) {
    console.log(`  Token: ${token}`);
  } else {
    console.log("  No token stored.");
  }
  return token;
}
