/**
 * Produce runtime dependencies by scanning built bundles for all bare
 * module specifiers and resolving versions from pnpm-lock.yaml.
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const rootDir = resolve(dirname(__filename), "..");

const distDir = process.argv[2] || join(rootDir, "apps", "tui", "dist");
const lockfilePath = process.argv[3] || join(rootDir, "pnpm-lock.yaml");

if (!fs.existsSync(distDir)) {
    console.error(`Error: ${distDir} does not exist. Build first.`);
    process.exit(1);
}

// ── Parse lockfile ────────────────────────────────────────────────────

const lockMap = new Map();
try {
    const raw = fs.readFileSync(lockfilePath, "utf8");
    // Match top-level keys like '@ff-labs/fff-node@0.10.3' or 'cli-table3@0.6.5':
    const re = /^[\s"']*(@[a-zA-Z][^\s"'@]*?(?:\/[a-zA-Z][^\s"'@]*)?)@(\d[^:'"()]*).*[:\[]/;
    for (const line of raw.split("\n")) {
        const m = line.match(re);
        if (m) lockMap.set(m[1], m[2]);
    }
    // Also try simpler non-scoped format: key@version:
    const simpleRe = /^[\s"']*([a-zA-Z][^\s"'@]*?)@(\d[^:'"()]*).*[:\[]/;
    for (const line of raw.split("\n")) {
        if (lockMap.has(line.trim().replace(/['"]$/,'').split('@')[0])) continue;
        const m = line.match(simpleRe);
        if (m && !m[1].includes('/')) {
            lockMap.set(m[1], m[2]);
        }
    }
} catch { /* ignore */ }

// Known node: core modules — never needed as npm deps
const CORE_BUILTINS = new Set([
    "async_hooks","buffer","child_process","cluster","console","constants",
    "crypto","dgram","diagnostics_channel","dns","domain","events",
    "fs","http","http2","https","inspector","module","net","os",
    "path","perf_hooks","process","punycode","querystring","readline",
    "repl","stream","string_decoder","sys","timers","tls","trace_events",
    "tty","url","util","v8","vm","wasi","worker_threads","zlib",
]);

// Local workspace packages that should never be emitted as runtime deps
// (they are either bundled or only used at build time)
const LOCAL_WORKSPACE_PACKAGES = new Set([
    // @nexus/* workspace packages
    "@nexus/factory",
    "@nexus/feature-flags",
    "@nexus/herdr",
    "@nexus/mini-apps",
    "@nexus/observability",
    "@nexus/pi-platform",
    "@nexus/runtime",
    "@nexus/tui-kit",
    "@nexus/console-table-printer",
    // @extensions/* workspace packages
    "@extensions/ai-providers",
    "@extensions/cmux",
    "@extensions/context-usage",
    "@extensions/exit-message",
    "@extensions/hotkeys",
    "@extensions/neo-editor",
    "@extensions/observations",
    "@extensions/pi-packages",
    "@extensions/rtk",
    "@extensions/shared",
    "@extensions/slash-menu",
    "@extensions/startup-hero",
    "@extensions/tron",
    "@extensions/web-search",
]);

// Names that look like packages but are actually string content
const STRING_CONTENT_FILTER = new Set([
    "In Progress",
    "AppKit","Foundation","Plan","Continue","Running","Done",
    "foo","my-extension","undefined",
]);

// ── Scan bundles ──────────────────────────────────────────────────────

const seen = new Set();
for (const entry of fs.readdirSync(distDir).filter(f => f.endsWith(".mjs"))) {
    const content = fs.readFileSync(join(distDir, entry), "utf8");
    for (const m of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) seen.add(m[1]);
    for (const m of content.matchAll(/await\s+import\(\s*['"]([^'"]+)['"]\s*\)/g)) seen.add(m[1]);
    for (const m of content.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) seen.add(m[1]);
}

const bareNames = [];
for (const spec of seen) {
    // Skip relative, node:, http URLs, data URIs
    if (spec.startsWith(".") || spec.startsWith("node:") ||
        spec.startsWith("http://") || spec.startsWith("https://") ||
        spec.startsWith("data:") || spec.startsWith("file://")) continue;
    // Must start with @ or letter
    if (!/^[a-zA-Z@]/.test(spec)) continue;
    // Resolve to package name
    let pkgName;
    if (spec.startsWith("@")) {
        const parts = spec.split("/");
        if (parts.length >= 2) pkgName = `${parts[0]}/${parts[1]}`;
    } else {
        pkgName = spec.split("/")[0];
    }
    if (!pkgName) continue;
    // Filter: skip node builtins, string-content false positives, local workspace packages
    if (CORE_BUILTINS.has(pkgName) || STRING_CONTENT_FILTER.has(pkgName)) continue;
    if (LOCAL_WORKSPACE_PACKAGES.has(pkgName)) continue;
    if (!bareNames.includes(pkgName)) bareNames.push(pkgName);
}

// ── Resolve & output ──────────────────────────────────────────────────

const result = {};
let warnCount = 0;
for (const name of bareNames.sort()) {
    const ver = lockMap.get(name);
    if (ver) {
        result[name] = "^" + ver;
    } else {
        // Fallback: check apps/tui/package.json direct deps
        const tuiPkg = JSON.parse(fs.readFileSync(join(rootDir, "apps", "tui", "package.json"), "utf8"));
        const dVer = tuiPkg.dependencies?.[name];
        if (dVer) {
            result[name] = dVer.replace("workspace:", "").replace(/^[\^~>=<!\s]+/, "") || dVer;
        } else {
            result[name] = "*";
            warnCount++;
        }
    }
}

console.log(JSON.stringify(result));
