/**
 * Herdr — workspace preparation and agent management library.
 *
 * This is the single source of truth for Herdr setup — both test code and
 * CLI entrypoints import from here.
 *
 * Module layout (each function in its own file):
 *   core/         — runHerdr, drill, resolveJustDevBinary
 *   workspace/    — prepareHerdr, createHerdrWorkspace, listHerdrWorkspaces,
 *                   getHerdrWorkspace, closeHerdrWorkspace
 *   tabs/         — createHerdrTab, listHerdrTabs, getHerdrTab, closeHerdrTab
 *   panes/        — listHerdrPanes, getHerdrPane, closeHerdrPane
 *   agents/       — startHerdrAgent, promptHerdrAgent, sendTextToAgent,
 *                   sendKeysToAgent, splitPaneRight, startForegroundAgent
 */

// Core primitives (low-level)
export { type HerdrResult, runHerdr } from "./core/runHerdr.js";
export { drill } from "./core/drill.js";
export { resolveJustDevBinary } from "./core/resolveJustDevBinary.js";

// Workspace operations
export { type PreparedHerdr, type PrepareHerdrOptions, prepareHerdr } from "./workspace/prepareHerdr.js";
export { createHerdrWorkspace } from "./workspace/createHerdrWorkspace.js";
export { listHerdrWorkspaces } from "./workspace/listHerdrWorkspaces.js";
export { getHerdrWorkspace } from "./workspace/getHerdrWorkspace.js";
export { closeHerdrWorkspace } from "./workspace/closeHerdrWorkspace.js";

// Tab operations
export { createHerdrTab } from "./tabs/createHerdrTab.js";
export { closeHerdrTab } from "./tabs/closeHerdrTab.js";
export { listHerdrTabs } from "./tabs/listHerdrTabs.js";
export { getHerdrTab } from "./tabs/getHerdrTab.js";

// Pane operations
export { listHerdrPanes } from "./panes/listHerdrPanes.js";
export { getHerdrPane } from "./panes/getHerdrPane.js";
export { closeHerdrPane } from "./panes/closeHerdrPane.js";

// Agent operations
export { startHerdrAgent, startHerdrAgentAsync } from "./agents/startHerdrAgent.js";
export { promptHerdrAgent, promptHerdrAgentAsync } from "./agents/promptHerdrAgent.js";
export { sendTextToAgent } from "./agents/sendTextToAgent.js";
export { sendKeysToAgent } from "./agents/sendKeysToAgent.js";
export { splitPaneRight } from "./agents/splitPaneRight.js";
export { startForegroundAgent } from "./agents/startForegroundAgent.js";
export { readAgentOutput, type ReadAgentOutputResult } from "./agents/readAgentOutput.js";
export { waitAgent, type WaitAgentOptions, type AgentWaitStatus } from "./agents/waitAgent.js";
export { stopAgent } from "./agents/stopAgent.js";

// Pane operations (additional)
export { runCommandInPane, type RunCommandInPaneResult } from "./panes/runCommandInPane.js";
export { readPaneOutput, type ReadPaneOutputResult } from "./panes/readPaneOutput.js";
