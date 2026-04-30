import { extractTweetUrls } from "../twitter/extractTweetUrls.js";

/**
 * Builds extra memory instructions for prompts that include tweet URLs.
 *
 * @param prompt User prompt text.
 * @returns System-prompt addition or undefined.
 */
export function buildMemorySystemPrompt(prompt: string): string | undefined {
	const urls = extractTweetUrls(prompt);
	if (urls.length === 0) return undefined;
	return [
		"Nexus memory detected Twitter/X status URLs in the user prompt.",
		"Use memory_fetch_tweet to read each tweet through Jina Reader before discussing storage.",
		"Ask what the user wants to do with the tweet; do not store anything until the user explicitly approves.",
		"Before storing, call memory_list_projects and ask the user to confirm the target project.",
		"If no suitable project exists, ask what the project is about, then create it by calling memory_add_tweet with projectName and projectDescription.",
		"Never store a package or app directly under the memory root; every app/package must live inside a project root.",
		"Distilled tweet knowledge must be one single line of at most 240 characters.",
		"Pass a user-meaningful operation-level commitMessage to memory_add_tweet; use memory_add_tweets when adding multiple items so they share one commit.",
		`Detected tweet URLs: ${urls.join(", ")}`,
	].join("\n");
}
