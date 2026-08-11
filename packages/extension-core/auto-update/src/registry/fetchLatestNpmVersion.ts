export type FetchNpmVersion = (
	url: string,
	init?: RequestInit,
) => Promise<Response>;

/**
 * Fetches the latest dist-tag version for one npm package.
 *
 * @param packageName npm package name to query.
 * @param fetcher Fetch implementation, injectable for deterministic tests.
 * @returns Latest version string from npm dist-tags.
 */
export async function fetchLatestNpmVersion(
	packageName: string,
	fetcher: FetchNpmVersion = fetch,
): Promise<string> {
	const packagePath = encodeURIComponent(packageName);
	const response = await fetcher(`https://registry.npmjs.org/${packagePath}`, {
		headers: { accept: "application/vnd.npm.install-v1+json" },
	});
	if (!response.ok)
		throw new Error(`npm registry request failed with HTTP ${response.status}`);
	const data = (await response.json()) as {
		"dist-tags"?: { latest?: unknown };
	};
	const latest = data["dist-tags"]?.latest;
	if (typeof latest !== "string" || latest.trim().length === 0) {
		throw new Error("npm registry response did not include a latest dist-tag");
	}
	return latest;
}
