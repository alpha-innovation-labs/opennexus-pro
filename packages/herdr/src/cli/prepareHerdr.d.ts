#!/usr/bin/env node
/**
 * CLI entrypoint for Herdr workspace preparation.
 *
 * Usage:
 *   just agent-e2e setup                          — create workspace + wait for pane
 *   just agent-e2e setup --label my-workspace     — custom label
 *   just agent-e2e start <paneId>                 — start an agent in a pane
 *   just agent-e2e prompt <agentName> "<prompt>"   — prompt an agent
 *   just agent-e2e send-keys <agentName> <keys>    — send key presses to an agent
 *   just agent-e2e read <agentName> [--lines N]    — read agent terminal output
 *   just agent-e2e close <workspaceId>             — close a workspace
 *   just agent-e2e full --label my-workspace       — setup + start + prompt in one shot
 *
 * This is the invokable bridge: tests import from @nexus/herdr, agents call
 * `just agent-e2e` directly.
 */
export {};
