import type { ManagedExtensionRow } from "../model/types";
import { createPackageSource } from "./createPackageSource";

/**
 * Searches npm for discoverable Pi packages and maps them to pi-packages rows.
 *
 * @param query User search query.
 * @param installedSources Package sources already configured in Nexus settings.
 * @returns Search result rows for the third-party tab.
 */
export async function fetchNpmPackageSearchRows(
	query: string,
	installedSources: Set<string>,
): Promise<ManagedExtensionRow[]> {
	const normalizedQuery = query.trim();
	if (normalizedQuery.length < 2) return [];
	const url = new URL("https://registry.npmjs.org/-/v1/search");
	url.searchParams.set("text", `${normalizedQuery} keywords:pi-package`);
	url.searchParams.set("size", "8");
	const response = await fetch(url);
	if (!response.ok)
		throw new Error(`npm search failed with HTTP ${response.status}`);
	const data = (await response.json()) as {
		objects?: Array<{
			package: {
				name: string;
				description?: string;
				version?: string;
				links?: { repository?: string; homepage?: string };
			};
		}>;
	};
	return (data.objects ?? []).flatMap((item) => {
		const source = createPackageSource(item.package.name);
		if (installedSources.has(source)) return [];
		return [
			{
				id: item.package.name,
				kind: "third-party" as const,
				status: "available" as const,
				features: [
					item.package.description ?? "",
					item.package.version
						? `latest ${item.package.version}`
						: "npm package",
				],
				rowType: "search" as const,
				source,
				repository:
					item.package.links?.repository ?? item.package.links?.homepage,
			},
		];
	});
}
