/**
 * Build a single bundled JS file using esbuild.
 *
 * esbuild compiles TypeScript directly to JavaScript and bundles it
 * into one file. No separate tsc step is needed.
 *
 * Strategy:
 * 1. Patch node_modules package.json exports to point to ./src/*.ts
 *    (they currently point to ./dist/*.js which doesn't exist).
 * 2. Run esbuild to bundle the TUI entry point.
 * 3. Restore original exports after build.
 */

import { build } from "esbuild";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

const ENTRY = resolve(ROOT, "apps/tui/src/index.ts");
const OUTPUT = resolve(ROOT, "dist/apps/tui/bundled/index.js");

// Workspace packages that need to be externalized
const EXTERNAL_PACKAGES = [
  "@nexus/pi-platform",
  "@nexus/runtime",
  "@nexus/mini-apps",
  "@nexus/observability",
  "@nexus/herdr",
  "@nexus/feature-flags",
  "@nexus/tui-kit",
  "child_process",
  "node:child_process",
  "node:os",
  "node:path",
  "node:tty",
  "node:fs",
  "node:fs/promises",
  "node:crypto",
  "node:events",
  "node:stream",
  "node:url",
  "node:util",
  "node:buffer",
  "node:process",
  "node:readline",
  "node:net",
  "node:dns",
  "node:http",
  "node:https",
  "node:zlib",
  "node:assert",
  "node:v8",
  "node:vm",
  "node:inspector",
  "node:perf_hooks",
  "node:timers",
  "node:worker_threads",
  "node:console",
  "node:diagnostics_channel",
];

// Packages with compiled dist/ outputs whose exports need fixing
const EXPORT_FIXES = [
  "packages/feature-flags",
  "packages/herdr",
  "packages/mini-apps",
  "packages/nexus-runtime",
  "packages/observability",
  "packages/pi-platform",
  "packages/tui-kit",
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

const backups = new Map();

function patchExports() {
  for (const pkg of EXPORT_FIXES) {
    const pkgJsonPath = resolve(ROOT, "node_modules", ...pkg.split("/"), "package.json");
    if (!existsSync(pkgJsonPath)) continue;
    try {
      const pkgJson = readJson(pkgJsonPath);
      if (pkgJson.exports) {
        backups.set(pkgJsonPath, { ...pkgJson.exports });
        // Rewrite: "./*": "./dist/*.js" -> "./*": "./src/*.ts"
        const fixed = {};
        for (const key of Object.keys(pkgJson.exports)) {
          const val = pkgJson.exports[key];
          if (typeof val === "string" && (val.includes("./dist/") || val.includes("./src/"))) {
            fixed[key.replace("./dist/", "./src/").replace(".js", ".ts")] = val.replace("./dist/", "./src/").replace(".js", ".ts");
          } else {
            fixed[key] = val;
          }
        }
        pkgJson.exports = fixed;
        writeJson(pkgJsonPath, pkgJson);
      }
    } catch {
      // Skip packages without exports
    }
  }
}

function restoreExports() {
  for (const [path, exports] of backups) {
    try {
      const pkgJson = readJson(path);
      pkgJson.exports = exports;
      writeJson(path, pkgJson);
    } catch {
      // Ignore
    }
  }
}

async function main() {
  try {
    console.log("🔧 Patching workspace package exports...");
    patchExports();

    console.log("📦 Bundling with esbuild...");
    await build({
      entryPoints: [ENTRY],
      bundle: true,
      minify: true,
      platform: "node",
      format: "esm",
      target: "node20",
      outfile: OUTPUT,
      external: EXTERNAL_PACKAGES,
      sourcemap: false,
      logLevel: "info",
    });

    console.log(`✅ Bundle created at ${OUTPUT}`);
  } catch (err) {
    console.error("❌ esbuild failed:", err.message);
    process.exit(1);
  } finally {
    console.log("🔧 Restoring workspace package exports...");
    restoreExports();
  }
}

main();
