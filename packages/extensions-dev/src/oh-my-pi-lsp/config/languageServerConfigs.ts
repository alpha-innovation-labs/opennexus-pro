import type { LanguageServerConfig } from "../types.js";

/**
 * Creates the bundled LSP server definitions ported from Oh My Pi's LSP model.
 *
 * @returns Language server configurations keyed by language family.
 */
export function languageServerConfigs(): LanguageServerConfig[] {
	return [
		{ id: "typescript", extensions: [".ts", ".tsx", ".js", ".jsx"], command: "typescript-language-server", args: ["--stdio"], languageId: "typescript" },
		{ id: "deno", extensions: [".ts", ".tsx", ".js", ".jsx"], command: "deno", args: ["lsp"], languageId: "typescript" },
		{ id: "python", extensions: [".py"], command: "pyright-langserver", args: ["--stdio"], languageId: "python" },
		{ id: "pylsp", extensions: [".py"], command: "pylsp", args: [], languageId: "python" },
		{ id: "rust", extensions: [".rs"], command: "rust-analyzer", args: [], languageId: "rust" },
		{ id: "go", extensions: [".go"], command: "gopls", args: [], languageId: "go" },
		{ id: "java", extensions: [".java"], command: "jdtls", args: [], languageId: "java" },
		{ id: "kotlin", extensions: [".kt", ".kts"], command: "kotlin-language-server", args: [], languageId: "kotlin" },
		{ id: "swift", extensions: [".swift"], command: "sourcekit-lsp", args: [], languageId: "swift" },
		{ id: "dart", extensions: [".dart"], command: "dart", args: ["language-server", "--protocol=lsp"], languageId: "dart" },
		{ id: "ruby", extensions: [".rb"], command: "ruby-lsp", args: [], languageId: "ruby" },
		{ id: "solargraph", extensions: [".rb"], command: "solargraph", args: ["stdio"], languageId: "ruby" },
		{ id: "php", extensions: [".php"], command: "intelephense", args: ["--stdio"], languageId: "php" },
		{ id: "csharp", extensions: [".cs"], command: "omnisharp", args: ["--languageserver"], languageId: "csharp" },
		{ id: "fsharp", extensions: [".fs", ".fsx"], command: "fsautocomplete", args: ["--adaptive-lsp-server-enabled"], languageId: "fsharp" },
		{ id: "cpp", extensions: [".c", ".cc", ".cpp", ".h", ".hpp"], command: "clangd", args: [], languageId: "cpp" },
		{ id: "zig", extensions: [".zig"], command: "zls", args: [], languageId: "zig" },
		{ id: "lua", extensions: [".lua"], command: "lua-language-server", args: [], languageId: "lua" },
		{ id: "haskell", extensions: [".hs"], command: "haskell-language-server-wrapper", args: ["--lsp"], languageId: "haskell" },
		{ id: "ocaml", extensions: [".ml", ".mli"], command: "ocamllsp", args: [], languageId: "ocaml" },
		{ id: "elixir", extensions: [".ex", ".exs"], command: "elixir-ls", args: [], languageId: "elixir" },
		{ id: "scala", extensions: [".scala", ".sc"], command: "metals", args: [], languageId: "scala" },
		{ id: "clojure", extensions: [".clj", ".cljs", ".cljc"], command: "clojure-lsp", args: [], languageId: "clojure" },
		{ id: "nix", extensions: [".nix"], command: "nil", args: [], languageId: "nix" },
		{ id: "terraform", extensions: [".tf", ".tfvars"], command: "terraform-ls", args: ["serve"], languageId: "terraform" },
		{ id: "bash", extensions: [".sh", ".bash", ".zsh"], command: "bash-language-server", args: ["start"], languageId: "shellscript" },
		{ id: "json", extensions: [".json", ".jsonc"], command: "vscode-json-language-server", args: ["--stdio"], languageId: "json" },
		{ id: "yaml", extensions: [".yaml", ".yml"], command: "yaml-language-server", args: ["--stdio"], languageId: "yaml" },
		{ id: "html", extensions: [".html", ".htm"], command: "vscode-html-language-server", args: ["--stdio"], languageId: "html" },
		{ id: "css", extensions: [".css", ".scss", ".less"], command: "vscode-css-language-server", args: ["--stdio"], languageId: "css" },
		{ id: "vue", extensions: [".vue"], command: "vue-language-server", args: ["--stdio"], languageId: "vue" },
		{ id: "svelte", extensions: [".svelte"], command: "svelteserver", args: ["--stdio"], languageId: "svelte" },
		{ id: "toml", extensions: [".toml"], command: "taplo", args: ["lsp", "stdio"], languageId: "toml" },
		{ id: "prisma", extensions: [".prisma"], command: "prisma-language-server", args: ["--stdio"], languageId: "prisma" },
		{ id: "docker", extensions: ["Dockerfile", ".dockerfile"], command: "docker-langserver", args: ["--stdio"], languageId: "dockerfile" },
		{ id: "gleam", extensions: [".gleam"], command: "gleam", args: ["lsp"], languageId: "gleam" },
		{ id: "eslint", extensions: [".ts", ".tsx", ".js", ".jsx"], command: "vscode-eslint-language-server", args: ["--stdio"], languageId: "typescript" },
	];
}
