#!/usr/bin/env node
import { spawn } from "node:child_process";

/**
 * Runs the real Nexus executable while satisfying RpcClient's JS cliPath contract.
 */
function main() {
  const command = process.env.NEXUS_ANNOTATION_BIN || "nexus";
  const child = spawn(command, process.argv.slice(2), { stdio: "inherit", env: process.env });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 1);
  });
}

main();
