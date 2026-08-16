/**
 * Parsed factory subcommand arguments.
 */
export type FactoryArgs =
	| { command: "list" }
	| { command: "explain" }
	| { command: "paths" }
	| {
			command: "create";
			name: string;
			args: string[];
	  }
	| {
			command: "read";
			name: string;
	  }
	| {
			command: "validate";
			name: string;
	  }
	| {
			command: "edit";
			name: string;
			stepId: string;
			field: string;
			value: string;
	  }
	| {
			command: "add-step";
			name: string;
			stepCommand: string;
			type?: "bash" | "agent";
	  }
	| {
			command: "remove-step";
			name: string;
			stepId: string;
	  }
	| {
			command: "add-control";
			name: string;
			type: "loop_until" | "parallel";
			maxIterations?: number;
	  }
	| {
			command: "remove-control";
			name: string;
			controlId: string;
	  }
	| {
			command: "validate-file";
			path: string;
	  }
	| {
			command: "run";
			name: string;
			inputs: Record<string, string>;
	  }
	| { command: "help"; invalidSubcommand?: string }
	| { command: string; invalidSubcommand: string };

/**
 * Parses factory CLI arguments into a subcommand.
 *
 * @param argv Raw CLI arguments (from process.argv.slice(2)).
 * @returns Parsed arguments.
 */
export function parseFactoryArgs(
	argv: readonly string[],
): FactoryArgs {
	const realArgs = argv.filter((a) => a !== "--");
	const scriptPath = "apps/tui/src/index.ts";
	const cliArgs = realArgs[0] === scriptPath ? realArgs.slice(1) : realArgs;

	const subcommand = cliArgs[1];

	if (!subcommand) {
		return { command: "help" };
	}

	switch (subcommand) {
		case "list":
			return { command: "list" };
		case "explain":
			return { command: "explain" };
		case "paths":
			return { command: "paths" };
		case "create":
			return {
				command: "create",
				name: cliArgs[2] ?? "",
				args: cliArgs.slice(3),
			};
		case "read":
			return {
				command: "read",
				name: cliArgs[2] ?? "",
			};
		case "validate":
			return {
				command: "validate",
				name: cliArgs[2] ?? "",
			};
		case "edit":
			return {
				command: "edit",
				name: cliArgs[2] ?? "",
				stepId: cliArgs[3] ?? "",
				field: cliArgs[4] ?? "",
				value: cliArgs.slice(5).join(" "),
			};
		case "add-step":
			return {
				command: "add-step",
				name: cliArgs[2] ?? "",
				stepCommand: cliArgs[3] ?? "",
				type: cliArgs[4] as "bash" | "agent" | undefined,
			};
		case "remove-step":
			return {
				command: "remove-step",
				name: cliArgs[2] ?? "",
				stepId: cliArgs[3] ?? "",
			};
		case "add-control":
			return {
				command: "add-control",
				name: cliArgs[2] ?? "",
				type: (cliArgs[3] ?? "loop_until") as "loop_until" | "parallel",
				maxIterations: cliArgs[4]
					? parseInt(cliArgs[4], 10)
					: undefined,
			};
		case "remove-control":
			return {
				command: "remove-control",
				name: cliArgs[2] ?? "",
				controlId: cliArgs[3] ?? "",
			};
		case "validate-file":
			return {
				command: "validate-file",
				path: cliArgs[2] ?? "",
			};
		case "run": {
			const name = cliArgs[2] ?? "";
			const inputs: Record<string, string> = {};

			// Parse --input key=value flags
			for (let i = 3; i < cliArgs.length; i++) {
				const arg = cliArgs[i];
				if (arg.startsWith("--input=")) {
					const kv = arg.slice("--input=".length);
					const eqIndex = kv.indexOf("=");
					if (eqIndex > 0) {
						inputs[kv.slice(0, eqIndex)] = kv.slice(eqIndex + 1);
					}
				} else if (arg.startsWith("--input")) {
					i++;
					const kv = cliArgs[i];
					const eqIndex = kv.indexOf("=");
					if (eqIndex > 0) {
						inputs[kv.slice(0, eqIndex)] = kv.slice(eqIndex + 1);
					}
				}
			}

			return {
				command: "run",
				name,
				inputs,
			};
	  }
		case "help":
			return { command: "help" };
		default:
			return { command: "help", invalidSubcommand: subcommand };
	}
}
