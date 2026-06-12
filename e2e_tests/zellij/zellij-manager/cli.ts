/**
 * cli.ts — Arg parsing, help text, and subcommand dispatch.
 *
 * Parses CLI arguments and routes to the appropriate subcommand handler.
 * Supports all subcommands defined in the plan:
 *   zellij-web start/stop/status, zellij-web token create/show,
 *   session create/delete/list,
 *   exec/exec-script, browser open/snapshot/fill/click/wait/screenshot/close,
 *   auth, dev
 */

import { portStart, portStop, portStatus, createToken, showToken } from "./zellij-web";
import { sessionCreate, sessionDelete, sessionList } from "./session";
import { execCommand, execScript } from "./exec";
import {
  browserOpen,
  browserScreenshot,
  browserSnapshot,
  browserFill,
  browserClick,
  browserWait,
  browserClose,
} from "./browser";
import { authFlow } from "./auth";
import { readState } from "./state";

/**
 * Print usage/help text for the CLI.
 */
export function printHelp(): void {
  console.log(`
zellij-manager — Always-on zellij session and browser manager

USAGE:
  zellij-manager <subcommand> [args]

ZELLIJ-WEB COMMANDS:
  zellij-web start [port]      Start zellij web server (once). Refuse if already running.
  zellij-web stop              Kill the web server process.
  zellij-web status            Show current port and PID.

  zellij-web token create      Create a new auth token.
  zellij-web token show        Show the stored token.

SESSION COMMANDS:
  session create <name>      Create a zellij background session.
  session delete <name>      Kill a zellij session.
  session list               List active sessions.

EXEC COMMANDS:
  exec <session> <cmd>       Paste a command + Enter into a zellij session.
  exec-script <session> <path>  Run a .sh script inside a session.

BROWSER COMMANDS:
  browser open <url>         Open a URL in the browser.
  browser snapshot           Take a page snapshot (interactive refs).
  browser fill <ref> <value> Fill an input field.
  browser click <ref>        Click a button.
  browser wait [opts]        Wait for navigation (e.g., --load networkidle).
  browser screenshot <path>  Save screenshot.
  browser close              Close browser session.

AUTH COMMAND:
  auth <session> [port] [screenshot]  Full auth flow: token → open → snapshot → fill → click → wait → screenshot → close.

DEVELOPMENT COMMAND:
  dev                        One-shot: run the full "just dev" flow (migrates existing workflow).
`);
}

/**
 * Parse CLI arguments and dispatch to the appropriate handler.
 *
 * @param args — Process.argv.slice(2) (without node and script path).
 */
export function dispatch(args: string[]): void {
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    return;
  }

  const subcommand = args[0];
  const subargs = args.slice(1);

  switch (subcommand) {
    // ── Zellij-web commands ────────────────────────────────────────
    case "zellij-web": {
      if (subargs.length === 0) {
        console.error("ERROR: 'zellij-web' requires a subcommand (start/stop/status/token).");
        printHelp();
        process.exit(1);
      }
      const sub = subargs[0];
      const subArgs = subargs.slice(1);
      switch (sub) {
        case "start":
          portStart(subArgs[0] ? parseInt(subArgs[0], 10) : undefined);
          break;
        case "stop":
          portStop();
          break;
        case "status":
          const status = portStatus();
          console.log(status.output);
          console.log(`Online: ${status.online}, Port: ${status.port}`);
          break;
        case "token": {
          if (subArgs.length === 0) {
            console.error("ERROR: 'zellij-web token' requires a subcommand (create/show).");
            process.exit(1);
          }
          const tokenSub = subArgs[0];
          const tokenArgs = subArgs.slice(1);
          switch (tokenSub) {
            case "create":
              createToken();
              break;
            case "show":
              showToken();
              break;
            default:
              console.error(`ERROR: Unknown token subcommand: ${tokenSub}`);
              process.exit(1);
          }
          break;
        }
        default:
          console.error(`ERROR: Unknown zellij-web subcommand: ${sub}`);
          process.exit(1);
      }
      break;
    }

    // ── Session commands ───────────────────────────────────────────
    case "session": {
      if (subargs.length === 0) {
        console.error("ERROR: 'session' requires a subcommand (create/delete/list).");
        printHelp();
        process.exit(1);
      }
      const sessionSub = subargs[0];
      const sessionArgs = subargs.slice(1);
      switch (sessionSub) {
        case "create":
          if (sessionArgs.length === 0) {
            console.error("ERROR: 'session create' requires a session name.");
            process.exit(1);
          }
          sessionCreate(sessionArgs[0]);
          break;
        case "delete":
          if (sessionArgs.length === 0) {
            console.error("ERROR: 'session delete' requires a session name.");
            process.exit(1);
          }
          sessionDelete(sessionArgs[0]);
          break;
        case "list":
          const list = sessionList();
          if (list.sessions.length === 0) {
            console.log("No active sessions.");
          } else {
            console.log("Active sessions:");
            for (const s of list.sessions) {
              console.log(`  - ${s}`);
            }
          }
          break;
        default:
          console.error(`ERROR: Unknown session subcommand: ${sessionSub}`);
          process.exit(1);
      }
      break;
    }

    // ── Exec commands ──────────────────────────────────────────────
    case "exec": {
      if (subargs.length < 2) {
        console.error("ERROR: 'exec' requires <session> <cmd>.");
        process.exit(1);
      }
      execCommand(subargs[0], subargs.slice(1).join(" "));
      break;
    }

    case "exec-script": {
      if (subargs.length < 2) {
        console.error("ERROR: 'exec-script' requires <session> <path>.");
        process.exit(1);
      }
      execScript(subargs[0], subargs[1]);
      break;
    }

    // ── Browser commands ───────────────────────────────────────────
    case "browser": {
      if (subargs.length === 0) {
        console.error("ERROR: 'browser' requires a subcommand (open/snapshot/fill/click/wait/screenshot/close).");
        printHelp();
        process.exit(1);
      }
      const browserSub = subargs[0];
      const browserArgs = subargs.slice(1);
      switch (browserSub) {
        case "open":
          if (browserArgs.length === 0) {
            console.error("ERROR: 'browser open' requires a URL.");
            process.exit(1);
          }
          browserOpen(browserArgs[0]);
          break;
        case "snapshot":
          browserSnapshot(browserArgs.includes("--all"));
          break;
        case "fill":
          if (browserArgs.length < 2) {
            console.error("ERROR: 'browser fill' requires <ref> <value>.");
            process.exit(1);
          }
          browserFill(browserArgs[0], browserArgs[1]);
          break;
        case "click":
          if (browserArgs.length === 0) {
            console.error("ERROR: 'browser click' requires <ref>.");
            process.exit(1);
          }
          browserClick(browserArgs[0]);
          break;
        case "wait":
          browserWait(browserArgs.join(" "));
          break;
        case "screenshot":
          if (browserArgs.length === 0) {
            console.error("ERROR: 'browser screenshot' requires <path>.");
            process.exit(1);
          }
          browserScreenshot(browserArgs[0]);
          break;
        case "close":
          browserClose();
          break;
        default:
          console.error(`ERROR: Unknown browser subcommand: ${browserSub}`);
          process.exit(1);
      }
      break;
    }

    // ── Auth command ───────────────────────────────────────────────
    case "auth": {
      if (subargs.length < 1) {
        console.error("ERROR: 'auth' requires <session>.");
        process.exit(1);
      }
      const session = subargs[0];
      const port = subargs[1] ? parseInt(subargs[1], 10) : 8082;
      const screenshot = subargs[2] || "./zellij-authenticated.png";
      authFlow(session, port, screenshot);
      break;
    }

    // ── Dev command (migrates existing workflow) ───────────────────
    case "dev": {
      const state = readState();

      // Parse optional flags: --session <name> --output <path> --workspace <dir> --commands <path>
      let session = "nexus-dev";
      let output = "./zellij-authenticated.png";
      let workspace = process.cwd();
      let commandsScript: string | undefined;

      for (let i = 0; i < subargs.length; i++) {
        switch (subargs[i]) {
          case "--session":
            session = subargs[++i] ?? (() => { console.error("ERROR: --session requires a value."); process.exit(1); })();
            break;
          case "--output":
            output = subargs[++i] ?? (() => { console.error("ERROR: --output requires a value."); process.exit(1); })();
            break;
          case "--workspace":
            workspace = subargs[++i] ?? (() => { console.error("ERROR: --workspace requires a value."); process.exit(1); })();
            break;
          case "--commands":
            commandsScript = subargs[++i];
            break;
        }
      }

      console.log("=== Dev flow (migration) ===");
      console.log(`  Session: ${session}`);
      console.log(`  Output: ${output}`);
      console.log(`  Workspace: ${workspace}`);

      // Step 1: Ensure web server is running.
      const status = portStatus();
      if (!status.online) {
        portStart(status.port);
      }

      // Step 2: Create the zellij session.
      // Build a temporary config that disables startup noise.
      const fs = require("node:fs");
      const os = require("node:os");
      const tmpConfig = fs.mkdtempSync(`${os.tmpdir()}/zellij-manager-`);
      const configPath = `${tmpConfig}/config.kdl`;
      fs.writeFileSync(configPath, `web_sharing "on"\nshow_startup_tips false\nshow_release_notes false\n`);

      try {
        // Create session with compact layout + web_sharing + no tips.
        sessionCreate(session, { layout: "compact", config: configPath });

        // Set PATH inside the session.
        execCommand(session, `export PATH="${workspace}:$PATH"`);

        // Execute the user-supplied commands script.
        if (commandsScript) {
          execScript(session, commandsScript);
        } else {
          // Default: run "nexus" command (old inline default).
          execCommand(session, "nexus");
        }

        // Step 3: Run full auth flow.
        authFlow(session, status.port, output);
      } finally {
        // Clean up temp config directory.
        try {
          fs.rmSync(tmpConfig, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors.
        }
      }

      console.log(`Done — screenshot saved to ${output}`);
      break;
    }

    // ── Unknown subcommand ─────────────────────────────────────────
    default:
      console.error(`ERROR: Unknown subcommand: ${subcommand}`);
      printHelp();
      process.exit(1);
  }
}
