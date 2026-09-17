import { SUBAGENT_LAUNCH_CUSTOM_TYPE } from "../session/launch-metadata";
import { SUBAGENT_RESULT_CUSTOM_TYPE } from "../delivery/types";

/**
 * Fixed, machine-checkable identifiers for the headless end-to-end validation of
 * the subagents background lifecycle.
 *
 * The whole design is "the session files as the oracle": the parent and child are
 * steered toward producing fixed values (marker tokens, a named file) and the
 * assertions check those fixed values in the transcript and on disk. Assertions
 * never parse prose — they check the fixed markers and the structural entries
 * (launch tool call, delivery message, child write call) that the system persists.
 */

/** The fixed token the child writes to its marker file. */
export const E2E_CHILD_MARKER = "NEXUS_E2E_CHILD_OK" as const;

/** The fixed token the parent emits as its final reply once the run's result arrives. */
export const E2E_PARENT_MARKER = "NEXUS_E2E_PARENT_OK" as const;

/** The display name of the run whose task writes the child marker file. */
export const E2E_RUN_NAME = "writer" as const;

/** The fixed file name (under the temp workspace) the writer run's task names. */
export const E2E_CHILD_MARKER_FILE = "e2e-child-marker.txt" as const;

/** The display name of the companion blocking run that holds the parent's turn open. */
export const E2E_HOLDER_RUN_NAME = "holder" as const;

/**
 * The fixed `sleep` duration (seconds) the holder run's task runs.
 *
 * The holder keeps the parent's turn open (its blocking launch is awaited) long
 * after the writer has settled, so the writer's result steer is guaranteed to
 * land in the parent while the parent is still streaming. The slack is the sleep
 * itself: the writer settles within one model round-trip of its file write, the
 * holder cannot settle before its sleep elapses.
 */
export const E2E_HOLDER_SLEEP_SECONDS = 15 as const;

/** Tool names the parent surface registers. */
export const LAUNCH_TOOL = "subagents_launch" as const;
export const KILL_TOOL = "subagents_kill" as const;
export const RESUME_TOOL = "subagents_resume" as const;

/** The built-in write tool the child uses to produce its side effect. */
export const WRITE_TOOL = "write" as const;

/** The custom message type the delivery layer persists in the parent's session. */
export const RESULT_CUSTOM_TYPE = SUBAGENT_RESULT_CUSTOM_TYPE;

/** The custom entry type the session layer persists in a run's seeded session file. */
export const LAUNCH_METADATA_CUSTOM_TYPE = SUBAGENT_LAUNCH_CUSTOM_TYPE;

/**
 * Environment variables the harness reads for the model-in-the-loop target.
 *
 * The headless run needs a reachable model. The harness builds a temporary pi
 * agent directory (a `models.json` pointing at an OpenAI-compatible endpoint plus
 * a `settings.json` default) and exports it as `PI_CODING_AGENT_DIR` for the parent
 * and, through the inherited environment, its children. The API key is required to
 * run; the base URL and model id have defaults for the local proxy setup.
 */
/** Required: the API key for the target model endpoint. */
export const E2E_API_KEY_ENV_VAR = "NEXUS_E2E_API_KEY" as const;
/** The OpenAI-compatible base URL. Default: the local LiteLLM proxy. */
export const E2E_BASE_URL_ENV_VAR = "NEXUS_E2E_BASE_URL" as const;
/** The model id the temporary models.json registers and the runs default to. */
export const E2E_MODEL_ENV_VAR = "NEXUS_E2E_MODEL" as const;
/** The pi command that launches the headless parent (default: `pi` on PATH). */
export const E2E_PI_COMMAND_ENV_VAR = "NEXUS_E2E_PI_COMMAND" as const;

/** Default base URL: the local LiteLLM proxy. */
export const E2E_BASE_URL_DEFAULT = "http://127.0.0.1:4000/v1" as const;
/** Default model id: a local Qwen served through the proxy. */
export const E2E_MODEL_DEFAULT = "qwen3.8-27b-mlx" as const;

/** The provider id the temporary models.json registers. */
export const E2E_PROVIDER_ID = "e2e" as const;

/** The env var that redirects pi's agent directory (models.json, settings.json). */
export const PI_AGENT_DIR_ENV_VAR = "PI_CODING_AGENT_DIR" as const;

/** The hard timeout for the whole headless run (the parent must exit under it). */
export const E2E_HARD_TIMEOUT_MS = 180_000 as const;
