import type { GitHubUrlInfo } from "./githubTypes";

const NON_CODE_SEGMENTS = new Set([
	"issues",
	"pull",
	"pulls",
	"discussions",
	"releases",
	"wiki",
	"actions",
]);

/**
 * Parses GitHub repository, tree, and blob URLs into code content coordinates.
 *
 * @param url URL to parse.
 * @returns Parsed GitHub URL info, or null for non-code GitHub URLs.
 */
export function parseGitHubUrl(url: string): GitHubUrlInfo | null {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return null;
	}
	if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com")
		return null;
	const segments = parsed.pathname
		.split("/")
		.filter(Boolean)
		.map(decodeURIComponent);
	if (segments.length < 2 || NON_CODE_SEGMENTS.has(segments[2]?.toLowerCase()))
		return null;
	const owner = segments[0];
	const repo = segments[1].replace(/\.git$/u, "");
	if (segments.length === 2) return { owner, repo, type: "root" };
	const action = segments[2];
	if ((action !== "tree" && action !== "blob") || segments.length < 4)
		return null;
	return {
		owner,
		repo,
		type: action,
		ref: segments[3],
		path: segments.slice(4).join("/"),
	};
}
