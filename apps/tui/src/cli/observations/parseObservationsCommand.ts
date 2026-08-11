import { readObservationsCommandTarget } from "./readObservationsCommandTarget";
import type { ObservationCliRequest } from "./types";

/**
 * Parses a Nexus observations command request.
 *
 * @param argv Raw CLI arguments starting with `observations`.
 * @returns Parsed request or an error message.
 */
export function parseObservationsCommand(
	argv: readonly string[],
): { request: ObservationCliRequest } | { error: string } {
	const action = argv[1];
	const json = argv.includes("--json");
	if (action === "get-location") return { request: { action, json } };
	if (
		action !== "list" &&
		action !== "delete" &&
		action !== "recreate" &&
		action !== "view"
	)
		return { error: "Missing or invalid observations action." };

	const target = readObservationsCommandTarget(argv);
	if (!target) return { error: `Missing target for observations ${action}.` };
	if (action !== "list" && json)
		return { error: "--json is only supported for observations list." };
	return { request: { action, target, json } };
}
