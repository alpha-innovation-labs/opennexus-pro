/**
 * Scan the built TUI bundles for ALL bare module specifiers and produce
 * a minimal set of dependencies needed at runtime.
 *
 * Walks every .mjs file under <root>/apps/tui/dist/, collects bare
 * import/export specifiers, filters out known builtins and relative
 * imports, then outputs the unique set as JSON suitable for embedding
 * into the release package.json.
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, extname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const rootDir = resolve(dirname(__filename), "..");

// Node.js built-in modules (including node: prefixed)
const builtins = new Set([
    ...["child_process","crypto","events","fs","fs/promises","module","os",
        "path","readline","string_decoder","stream","stream/promises",
        "timers","timers/promises","url","util","worker_threads",
        "async_hooks","buffer","cluster","dns","dns/promises","domain",
        "http","https","inspector","net","perf_hooks","punycode",
        "querystring","repl","tls","tty","v8","vm","zlib"],
].map(b => b));
builtins.add("events");

const distDir = join(rootDir, "apps", "tui", "dist");
if (!fs.existsSync(distDir)) {
    console.error(`Error: ${distDir} does not exist. Run \`turbo build --filter=@apps/app-tui\` first.`);
    process.exit(1);
}

const specs = new Set();

for (const entry of fs.readdirSync(distDir)) {
    const fullPath = join(distDir, entry);
    if (extname(entry) !== ".mjs") continue;
    const content = fs.readFileSync(fullPath, "utf8");

    // Match static imports: from "...", from '...'
    for (const m of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        specs.add(m[1]);
    }
    // Match dynamic imports: import("..."), import('...')
    for (const m of content.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        specs.add(m[1]);
    }
    // Match import() bare specifier: await import("@scope/pkg")
    for (const m of content.matchAll(/await\s+import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        specs.add(m[1]);
    }
}

// Filter: keep only bare specifiers (no relative paths, no URLs, no data URIs)
// Also skip weird string literals that slipped in
const filtered = [];
const excludePatterns = ["/dist-types/", '.d'];
for (const spec of specs) {
    // Skip relative imports
    if (spec.startsWith(".")) continue;
    // Skip node: prefix — handled by Node.js natively
    if (spec.startsWith("node:")) {
        // Extract the builtin name and verify it exists
        const core = spec.slice(5);
        if (core && !builtins.has(core)) filtered.push(core);
        continue;
    }
    // Skip URLs and data URIs
    if (spec.startsWith("http://") || spec.startsWith("https://") || spec.startsWith("data:")) continue;
    // Skip obvious non-import strings
    if (spec.includes(":") && !spec.startsWith("@")) continue;
    // Skip type-only imports from .d.ts references inside bundled code
    if (excludePatterns.some(p => spec.includes(p))) continue;
    filtered.push(spec);
}

// Resolve scoped names to package names for dedup
const seen = new Map();
for (const spec of filtered) {
    let pkgName;
    if (spec.startsWith("@")) {
        const parts = spec.split("/");
        pkgName = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec;
    } else {
        pkgName = spec.split("/")[0];
    }
    // Only keep if not already seen
    if (!seen.has(pkgName)) {
        seen.set(pkgName, null); // version will be filled later
    }
}

console.log(JSON.stringify([...seen.keys()]));