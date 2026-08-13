# Attempt 5: Improve `resolveTransitive` to Prefer Standalone Packages

## What Changed from Attempt 4

### The Problem with `resolveTransitive`

The `resolveTransitive` function in `loader.js` walks up from the loader file to find the `.pnpm` directory, then iterates over all `.pnpm` entries to find a matching package. The issue is that it returns the **first** match found, and `fs.readdirSync` returns entries in filesystem-dependent order (typically alphabetical).

Since `@earendil-works+pi-tui@0.84.1` comes before `marked@18.0.5` alphabetically (because `@` < `m`), the function would find `marked` inside the `pi-tui` pnpm tree first. While this `marked` is a symlink to the standalone `marked@18.0.5`, relying on symlink resolution adds complexity and potential failure points.

### The Fix

Modified `resolveTransitive` to:
1. Sort entries alphabetically for deterministic behavior
2. Prefer **standalone** packages over **transitive** ones
3. A standalone package is identified by checking if the entry name starts with the specifier followed by `@` (e.g., `marked@18.0.5`)
4. If no standalone match is found, fall back to the first transitive match

This ensures that `marked` resolves to `/Users/alpha/workspace/alpha-innovation-labs/__nexus/nexus-tui-awesome/node_modules/.pnpm/marked@18.0.5/node_modules/marked/lib/marked.esm.js` instead of the nested copy inside `pi-tui`'s pnpm tree.

### Code Change

In `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`:

```javascript
const resolveTransitive = (specifier) => {
    try {
        return require.resolve(specifier);
    }
    catch {
        // pnpm: walk up from the current file to find .pnpm/
        const pkgRoot = path.dirname(fileURLToPath(import.meta.url));
        let dir = path.dirname(pkgRoot);
        let pnpmBase = null;
        for (let i = 0; i < 10; i++) {
            const candidate = path.join(dir, ".pnpm");
            if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
                pnpmBase = candidate;
                break;
            }
            dir = path.dirname(dir);
            if (dir === "/" || dir === "") break;
        }
        if (!pnpmBase) return null;
        // Search for the package inside .pnpm/
        // Prefer standalone packages (e.g. "marked@18.0.5") over
        // transitive deps nested inside other packages (e.g.
        // "@scope+pkg@1.0.0/node_modules/marked").
        const entries = fs.readdirSync(pnpmBase).sort();
        let bestMatch = null;
        for (const entry of entries) {
            const nodeModulesPath = path.join(pnpmBase, entry, "node_modules", specifier);
            if (fs.existsSync(nodeModulesPath)) {
                const pkgJsonPath = path.join(nodeModulesPath, "package.json");
                if (fs.existsSync(pkgJsonPath)) {
                    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
                    const main = pkg.main || "index.js";
                    const mainPath = path.join(nodeModulesPath, main);
                    if (fs.existsSync(mainPath)) {
                        const isStandalone = entry.startsWith(specifier + "@") ||
                            entry.startsWith(specifier.split("/").join("+") + "@");
                        if (isStandalone) {
                            return mainPath;
                        }
                        if (!bestMatch) bestMatch = mainPath;
                    }
                }
            }
        }
        return bestMatch;
    }
};
```

## Files Modified

- `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` — improved `resolveTransitive` to prefer standalone packages

## Notes

- The symlink `apps/tui/node_modules/marked -> ../../node_modules/.pnpm/marked@18.0.5/node_modules/marked` is still in place as a backup
- This fix makes the `marked` resolution deterministic and robust
- Other transitive dependencies might need similar treatment if they cause resolution errors
