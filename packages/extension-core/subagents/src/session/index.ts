/**
 * Session-state layer for the subagents extension.
 *
 * Seeds a run's JSONL session file (the durable record) in one of three modes
 * and persists the launch config inside it. See
 * context/extension/subagents/session-state.md.
 */

export {
	createLaunchMetadataEntry,
	readSubagentLaunchConfig,
	SUBAGENT_LAUNCH_CUSTOM_TYPE,
} from "./launch-metadata";
export { seedSubagentSession } from "./seed";
export type {
	SeedSubagentSessionOptions,
	SessionMode,
	SubagentLaunchConfig,
	SubagentLaunchMetadata,
	SubagentSessionHandle,
} from "./types";
