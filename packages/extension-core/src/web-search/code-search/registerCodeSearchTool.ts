import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { formatCodeSearchResults } from "./formatCodeSearchResults.js";
import { searchGitHubRepositories } from "./searchGitHubRepositories.js";

/**
 * Registers a provider-key-free code_search tool backed by GitHub repository search.
 *
 * @param pi Pi extension API.
 */
export function registerCodeSearchTool(pi: ExtensionAPI): void {
  pi.registerTool(defineTool({
    name: "code_search",
    label: "Code Search",
    description: "Search public GitHub repositories for code examples, documentation, and API references.",
    promptSnippet: "Use code_search to find public GitHub repositories related to a coding topic.",
    parameters: Type.Object({
      query: Type.String({ description: "Code, library, API, or documentation topic to search for" }),
      language: Type.Optional(Type.String({ description: "Optional programming language qualifier" })),
      numResults: Type.Optional(Type.Number({ description: "Number of repositories to return, max 10" })),
    }),
    async execute(_toolCallId, params, signal) {
      const data = await searchGitHubRepositories(params.query, params.language, params.numResults ?? 5, signal);
      return { content: [{ type: "text", text: formatCodeSearchResults(params.query, data) }], details: { source: "github", count: data.items?.length ?? 0 } };
    },
  }));
}
