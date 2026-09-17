import type { AgentProfile, CompiledProfile } from "./types";
import { PI_DENY_TOOLS_ENV_VAR } from "./types";

/**
 * Compile an agent profile into the child invocation (argv, environment, and
 * working directory).
 *
 * Each profile field lands in exactly one place on the child invocation:
 *
 * | Profile field       | Child invocation                                  |
 * |---------------------|---------------------------------------------------|
 * | `model`, `thinking` | a single `--model <value>` (`<model>:<thinking>`) |
 * | `tools`             | a `--tools <allowlist>` argument                  |
 * | `deny`              | the `PI_DENY_TOOLS` environment variable          |
 * | `skills`, `inject`  | `--skill <...>` launch arguments                  |
 * | `noContextFiles`    | `--no-context-files`                              |
 * | `systemPrompt`, `systemPromptMode` | `--system-prompt` or `--append-system-prompt` |
 * | `identity`, `contextBoundary` | `--append-system-prompt` (scope fixed at launch) |
 * | `cwd`               | the spawn working directory                       |
 * | `env`               | merged into the child environment                 |
 * | `flags`             | appended to the argv                              |
 *
 * The result is a fresh process variation: one argv, one environment, one
 * working directory. The caller (the OS-process layer) owns the session/task
 * arguments and the spawn itself; this compiler only bakes the profile in.
 *
 * @param profile The profile frontmatter to compile.
 * @returns The compiled child invocation.
 */
export function compileAgentProfile(profile: AgentProfile): CompiledProfile {
	const argv: string[] = [];
	const env: Record<string, string> = { ...profile.env };

	// model + thinking -> a single --model value. The pi --model flag takes a
	// "provider/id" and an optional ":<thinking>" suffix, so both fields land in
	// the one flag rather than a separate --thinking.
	if (profile.model !== undefined || profile.thinking !== undefined) {
		const value = buildModelValue(profile.model, profile.thinking);
		argv.push("--model", value);
	}

	// tools -> the --tools allowlist (one argument for the whole list).
	if (hasList(profile.tools)) {
		argv.push("--tools", joinList(profile.tools));
	}

	// deny -> the PI_DENY_TOOLS environment variable. This is the one field that
	// lands in the environment instead of the argv.
	if (hasList(profile.deny)) {
		env[PI_DENY_TOOLS_ENV_VAR] = joinList(profile.deny);
	}

	// skills + inject -> --skill launch arguments, in order (skills first).
	for (const skill of profile.skills ?? []) {
		argv.push("--skill", skill);
	}
	for (const injected of profile.inject ?? []) {
		argv.push("--skill", injected);
	}

	// noContextFiles -> --no-context-files.
	if (profile.noContextFiles === true) {
		argv.push("--no-context-files");
	}

	// systemPrompt + systemPromptMode -> --system-prompt (replace) or
	// --append-system-prompt (append).
	const systemPromptMode = profile.systemPromptMode ?? "append";
	if (hasText(profile.systemPrompt)) {
		if (systemPromptMode === "replace") {
			argv.push("--system-prompt", profile.systemPrompt as string);
		} else {
			argv.push("--append-system-prompt", profile.systemPrompt as string);
		}
	}

	// identity + context-boundary -> appended to the system prompt so the child's
	// sense of scope is fixed at launch, not inferred from the task. Identity
	// (who the child is) comes first; the boundary (what it may and may not do)
	// second. Both ride --append-system-prompt regardless of the profile's own
	// mode, because they are additive scope, not a prompt override.
	if (hasText(profile.identity)) {
		argv.push("--append-system-prompt", profile.identity as string);
	}
	if (hasText(profile.contextBoundary)) {
		argv.push("--append-system-prompt", profile.contextBoundary as string);
	}

	// flags -> appended to the argv, in order, last.
	for (const flag of profile.flags ?? []) {
		argv.push(flag);
	}

	const cwd = hasText(profile.cwd) ? (profile.cwd as string) : undefined;

	return { argv, env, cwd };
}

/**
 * Build the single `--model` value from the model identifier and the optional
 * thinking suffix. The flag form is `<model>:<thinking>`; a missing model or
 * thinking yields the remaining half (e.g. `:high` or `anthropic/claude-sonnet`).
 */
function buildModelValue(
	model: string | undefined,
	thinking: string | undefined,
): string {
	const base = model ?? "";
	if (thinking === undefined) return base;
	return base === "" ? `:${thinking}` : `${base}:${thinking}`;
}

/** True when a list field carries at least one non-empty entry. */
function hasList(values: readonly string[] | undefined): values is string[] {
	return values !== undefined && values.length > 0;
}

/** True when a text field carries non-whitespace content. */
function hasText(value: string | undefined): value is string {
	return value !== undefined && value.trim().length > 0;
}

/** Join a tool list into the comma-separated form pi expects on the command line. */
function joinList(values: readonly string[]): string {
	return values.join(",");
}
