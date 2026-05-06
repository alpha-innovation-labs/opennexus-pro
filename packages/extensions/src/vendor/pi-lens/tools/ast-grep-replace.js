/**
 * ast_grep_replace tool definition
 *
 * Extracted from index.ts for maintainability.
 */
import { Type } from "typebox";
import { LANGUAGES } from "./shared.js";
export function createAstGrepReplaceTool(astGrepClient) {
    return {
        name: "ast_grep_replace",
        label: "AST Replace",
        description: "Replace code using AST-aware pattern matching. IMPORTANT: Use specific AST patterns, not text. Dry-run by default (use apply=true to apply).\n\n" +
            "✅ GOOD patterns (single AST node):\n" +
            "  - pattern='console.log($MSG)' rewrite='logger.info($MSG)'\n" +
            "  - pattern='var $X' rewrite='let $X'\n" +
            "  - pattern='function $NAME() { }' rewrite='' (delete)\n\n" +
            "❌ BAD patterns (will error):\n" +
            "  - Raw text without code structure\n" +
            '  - Missing parentheses: use it($TEST) not it"text"\n' +
            "  - Incomplete code fragments\n\n" +
            "Always use 'paths' to scope to specific files/folders. Dry-run first to preview changes.",
        promptSnippet: "Use ast_grep_replace for AST-aware find-and-replace",
        parameters: Type.Object({
            pattern: Type.String({
                description: "AST pattern to match (be specific with context)",
            }),
            rewrite: Type.String({
                description: "Replacement using meta-variables from pattern",
            }),
            lang: Type.String({
                enum: [...LANGUAGES],
                description: "Target language",
            }),
            paths: Type.Optional(Type.Array(Type.String(), { description: "Specific files/folders" })),
            apply: Type.Optional(Type.Boolean({ description: "Apply changes (default: false)" })),
        }),
        async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
            if (!(await astGrepClient.ensureAvailable())) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "ast-grep CLI not found. Install: npm i -D @ast-grep/cli",
                        },
                    ],
                    isError: true,
                    details: {},
                };
            }
            const { pattern, rewrite, paths, apply } = params;
            // Strip surrounding quotes if the LLM over-quoted the value (e.g. '"typescript"')
            const lang = (params.lang ?? "").replace(/^"|"$/g, "");
            const searchPaths = paths?.length ? paths : [ctx.cwd || "."];
            const result = await astGrepClient.replace(pattern, rewrite, lang, searchPaths, apply ?? false);
            if (result.error) {
                return {
                    content: [{ type: "text", text: `Error: ${result.error}` }],
                    isError: true,
                    details: {},
                };
            }
            const isDryRun = !apply;
            const output = astGrepClient.formatMatches(result.matches, isDryRun, true);
            return {
                content: [{ type: "text", text: output }],
                details: { matchCount: result.matches.length, applied: apply ?? false },
            };
        },
    };
}
