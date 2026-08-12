import {
	getModelCachePath,
	readProviderStateCache,
} from "@extensions/ai-providers";
import { readProviderConfig } from "@extensions/ai-providers";
import type { AiGateway } from "@extensions/ai-providers";
import { readNexusUserConfig } from "@nexus/runtime";
import { Table } from "@nexus/console-table-printer";
import { GRAY, GREEN, RED, RESET } from "../shared/ansiColors";
import { getAllProviderIds } from "./getAllProviderIds";

interface ListRow {
	providerId: string;
	enabled: string;
	reachable: string;
	authorized: string;
	models: number;
}

/**
 * Handles the "list" subcommand: displays all providers in a table
 * with columns for providerId, enabled status, reachability, and model count.
 *
 * @param json Whether to print JSON output.
 * @param gateways Array of gateway instances.
 * @returns Exit code.
 */
export async function handleListCommand(
	json: boolean,
	gateways: AiGateway[],
): Promise<number> {
	const knownProviderIds = getAllProviderIds();
	const gatewayMap = new Map<string, AiGateway>();
	for (const gw of gateways) {
		gatewayMap.set(gw.providerId, gw);
	}

	// Read enabled states and dynamic config from config.json.
	const userConfig = readNexusUserConfig();
	const providerStates = userConfig.providers ?? {};
	const providerConfig = readProviderConfig();
	const configuredProviderIds = new Set<string>(Object.keys(providerConfig));

	// Merge: known providers + dynamically configured ones not already known.
	const allProviderIds = [...knownProviderIds];
	for (const id of configuredProviderIds) {
		if (!allProviderIds.includes(id)) {
			allProviderIds.push(id);
		}
	}

	const rows: ListRow[] = [];

	// Load cached models (written by `refresh`). Probe is done live.
	const cachePath = getModelCachePath();
	const stateCache = await readProviderStateCache(cachePath);

	for (const providerId of allProviderIds) {
		const gw = gatewayMap.get(providerId);
		const explicitEnabled = providerStates[providerId]?.enabled;
		const enabled = explicitEnabled === false ? "No" : "Yes";

		let reachable = "No";
		let authorized = "No";
		let modelCount = 0;

		const cached = stateCache[providerId];
		if (cached) {
			// Cache hit: use cached model count.
			modelCount = cached.length;
		}
		// Probe live for status (probe is no longer cached).
		if (gw) {
			const probe = await gw.exists();
			if (probe.status === "ok") {
				reachable = "Yes";
				authorized = "Yes";
			} else if (
				probe.status === "access-denied" ||
				probe.status === "not-a-gateway"
			) {
				reachable = "Yes";
				authorized = "No";
			}
			// not-a-gateway and unreachable → reachable=No, authorized=No (default)
		}

		rows.push({
			providerId,
			enabled,
			reachable,
			authorized,
			models: modelCount,
		});
	}

	// Sort: green (reachable+authorized) first, red (reachable but not authorized) second,
	// gray (not reachable) third, gray (disabled) last.
	rows.sort((a, b) => {
		const aDisabled = providerStates[a.providerId]?.enabled === false;
		const bDisabled = providerStates[b.providerId]?.enabled === false;
		// Priority: green=0 > red=1 > gray=2 > disabled=3
		const aPriority = aDisabled
			? 3
			: a.authorized === "Yes"
				? 0
				: a.reachable === "Yes"
					? 1
					: 2;
		const bPriority = bDisabled
			? 3
			: b.authorized === "Yes"
				? 0
				: b.reachable === "Yes"
					? 1
					: 2;
		if (aPriority !== bPriority) return aPriority - bPriority;

		// Within green: by model count desc, then providerId
		if (a.authorized === "Yes" && !aDisabled) {
			if (b.models !== a.models) return b.models - a.models;
			return a.providerId.localeCompare(b.providerId);
		}
		// Within red/gray: by providerId
		return a.providerId.localeCompare(b.providerId);
	});

	if (json) {
		console.log(JSON.stringify(rows, null, 2));
		return 0;
	}

	const tableData = rows.map((row) => {
		const disabled = providerStates[row.providerId]?.enabled === false;

		// Disabled → gray, regardless of reachability
		if (disabled) {
			return {
				Provider: `${GRAY}${row.providerId}${RESET}`,
				Enabled: `${GRAY}${row.enabled}${RESET}`,
				Reachable: `${GRAY}${row.reachable}${RESET}`,
				Authorized: `${GRAY}${row.authorized}${RESET}`,
				Models: `${GRAY}${row.models}${RESET}`,
			};
		}

		// Enabled + reachable + authorized → green
		if (row.authorized === "Yes") {
			return {
				Provider: `${GREEN}${row.providerId}${RESET}`,
				Enabled: `${GREEN}${row.enabled}${RESET}`,
				Reachable: `${GREEN}${row.reachable}${RESET}`,
				Authorized: `${GREEN}${row.authorized}${RESET}`,
				Models: `${GREEN}${row.models}${RESET}`,
			};
		}

		// Enabled + reachable but not authorized → red
		if (row.reachable === "Yes") {
			return {
				Provider: `${RED}${row.providerId}${RESET}`,
				Enabled: `${RED}${row.enabled}${RESET}`,
				Reachable: `${RED}${row.reachable}${RESET}`,
				Authorized: `${RED}${row.authorized}${RESET}`,
				Models: `${RED}${row.models}${RESET}`,
			};
		}

		// Enabled + not reachable → gray
		return {
			Provider: `${GRAY}${row.providerId}${RESET}`,
			Enabled: `${GRAY}${row.enabled}${RESET}`,
			Reachable: `${GRAY}${row.reachable}${RESET}`,
			Authorized: `${GRAY}${row.authorized}${RESET}`,
			Models: `${GRAY}${row.models}${RESET}`,
		};
	});

	const ct = new Table({
		columns: [
			{ name: "Provider", alignment: "left" },
			{ name: "Enabled", alignment: "left" },
			{ name: "Reachable", alignment: "left" },
			{ name: "Authorized", alignment: "left" },
			{ name: "Models", alignment: "right" },
		],
		// border removed — console-table-printer no longer accepts it
	});
	ct.addRows(tableData);
	ct.printTable();

	return 0;
}
