# Attempt 6: Fix `Cannot find module '.'` Error When Loading `@plannotator/pi-extension`

## Error

```
Error: Failed to load extension "/Users/alpha/.local/share/nexus/agent/npm/node_modules/@plannotator/pi-extension": Failed to load extension: Cannot find module '.'
Require stack:
- /Users/alpha/workspace/alpha-innovation-labs/__nexus/nexus-tui-awesome/node_modules/.pnpm/@earendil-works+pi-tui@0.84.1/node_modules/@earendil-works/pi-tui/dist/components/markdown.js
Hint: Start without extensions using "pi -ne".
```

## Root Cause Analysis

### The Extension Manifest

The `@plannotator/pi-extension` package has this in its `package.json`:

```json
{
  "pi": {
    "extensions": ["./"]
  }
}
```

The `"./"` entry means "load the extension from the root of this package."

### How `resolveExtensionEntries` Handles `"./"`

In `loader.js`, the `resolveExtensionEntries` function processes the pi manifest:

```js
for (const extPath of manifest.extensions) {
    const resolvedExtPath = path.resolve(dir, extPath);
    if (fs.existsSync(resolvedExtPath)) {
        entries.push(resolvedExtPath);
    }
}
```

When `extPath` is `"./"`:
1. `path.resolve(dir, "./")` → resolves to `dir` itself (the package directory, e.g. `/Users/alpha/.local/share/nexus/agent/npm/node_modules/@plannotator/pi-extension/`)
2. `fs.existsSync(dir)` → `true` (it's a real directory)
3. The **directory path** gets pushed to `entries`

### Why jiti Fails

Later, `loadExtensionModule` calls `jiti.import(resolvedExtPath)` where `resolvedExtPath` is a **directory path**, not a file. jiti tries to resolve `.` as a module and fails with:

```
Cannot find module '.'
```

This is a fundamental mismatch: the extension manifest says `"./"` (meaning "the package root as the entry point"), but the loader treats it as a file path and passes the directory to jiti.

### Why This Wasn't Caught Before

The `"./"` convention is valid in package.json `pi.extensions` — it means "the default entry point of this package." The loader should resolve it to `index.ts` or `index.js` inside the directory. But the code never checks whether the resolved path is a directory; it just checks `fs.existsSync()` which returns true for both files and directories.

## What Previous Attempts Fixed

### Attempt 1: `settings.json` missing
Fixed by copying `settings.json` into the build output. Different error entirely.

### Attempt 2: `dark.json` theme missing
Fixed by setting `PI_PACKAGE_DIR` and copying theme files. Different error.

### Attempt 3: `(intermediate value).resolve is not a function`
Fixed by patching `import.meta.resolve` in the loader to use multi-tier fallback. Different error.

### Attempt 4: `Cannot find module 'marked'`
Fixed by adding `marked` to the aliases in `getAliases()`. Different error.

### Attempt 5: Improve `resolveTransitive` to prefer standalone packages
Improved `resolveTransitive` to sort and prefer standalone pnpm entries. Different error.

### Attempt 6 (current): `Cannot find module '.'`
This is the **actual current error** — the loader passes a directory path to jiti.

## What Was Changed

### Modified: `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`

In the `resolveExtensionEntries` function, added a directory check when processing `pi.extensions` entries:

```js
for (const extPath of manifest.extensions) {
    let resolvedExtPath = path.resolve(dir, extPath);
    // If the resolved path is a directory (e.g. "./" in pi-manifest),
    // look for index.ts or index.js inside it instead of passing the
    // directory path to jiti (which fails with "Cannot find module '.'").
    if (fs.existsSync(resolvedExtPath) && fs.statSync(resolvedExtPath).isDirectory()) {
        const indexTs = path.join(resolvedExtPath, "index.ts");
        const indexJs = path.join(resolvedExtPath, "index.js");
        if (fs.existsSync(indexTs)) {
            resolvedExtPath = indexTs;
        }
        else if (fs.existsSync(indexJs)) {
            resolvedExtPath = indexJs;
        }
        else {
            // Directory exists but no index file — skip.
            continue;
        }
    }
    if (fs.existsSync(resolvedExtPath)) {
        entries.push(resolvedExtPath);
    }
}
```

### Key Changes from Original

1. Added `let` instead of `const` for `resolvedExtPath` so it can be reassigned
2. Added `fs.statSync(resolvedExtPath).isDirectory()` check after `fs.existsSync()`
3. When it's a directory, look for `index.ts` first, then `index.js`
4. If neither exists, skip the entry (don't add a broken path)

### Why This Fix Works

1. When `extPath` is `"./"`, `path.resolve(dir, "./")` resolves to `dir`
2. The new code detects that `dir` is a directory
3. It finds `index.ts` inside the directory (which exists in `@plannotator/pi-extension`)
4. It sets `resolvedExtPath` to the full path of `index.ts`
5. jiti receives a valid file path and can load the module

### Scope of the Fix

This fix also applies to:
- `discoverExtensionsInDir()` → calls `resolveExtensionEntries()` for subdirectories
- `discoverAndLoadExtensions()` → calls `resolveExtensionEntries()` for configured directory paths

So any extension using `"./"` or any other directory path in its pi manifest will now be handled correctly.

## What to Try Next

Run the binary (`just dev`) and verify:
1. `@plannotator/pi-extension` loads without the "Cannot find module '.'" error
2. Other extensions that use `"./"` in their pi manifest also load correctly
3. Extensions that specify explicit file paths (e.g. `"./src/extension.ts"`) still work

If the error persists, check whether the same issue affects other extension packages or whether jiti has additional resolution quirks.
