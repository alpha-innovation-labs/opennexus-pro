/**
 * Agent-profile layer for the subagents extension.
 *
 * Compiles an agent profile's frontmatter into the child's argv and environment
 * before spawn, so each run is a freshly-baked process variation with its own
 * argv, environment, and working directory. The identity and context-boundary
 * prompts are appended to the system prompt so the child's scope is fixed at
 * launch. See context/extension/subagents/agent-profiles.md.
 */

export { compileAgentProfile } from "./compile";
export type {
	AgentProfile,
	CompiledProfile,
	SystemPromptMode,
} from "./types";
export { PI_DENY_TOOLS_ENV_VAR } from "./types";
