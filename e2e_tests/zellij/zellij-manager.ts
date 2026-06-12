/**
 * zellij-manager.ts — Main CLI entry point.
 *
 * Arg parsing and subcommand dispatch for the always-on zellij manager.
 * This is NOT a backgrounded process — it IS the foreground daemon.
 * Start it once per development session.
 *
 * Usage: zellij-manager <subcommand> [args]
 * See --help for all available subcommands.
 */

import { dispatch } from "./zellij-manager/cli";

// Strip node and script path from argv, pass rest to dispatch.
dispatch(process.argv.slice(2));
