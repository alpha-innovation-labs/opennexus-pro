Installs, removes, and updates third-party packages through Pi's package manager and loads them from the agent directory. The CLI `nexus install` command and the modal share the same install path and persist enablement through the Nexus overlay rather than Pi's settings file.

## Install path

`nexus install <source> [-l]` normalizes the source, runs Pi's `packageManager.install`, and then sets the source enabled in the [[features/package/persist-package-enable-state|enable overlay]]. `-l` installs into project scope instead of user scope. Source normalization turns a bare name into `npm:<name>`, maps a repository URL to its npm package name, and passes through existing `npm:`, `git:`, `http(s)://`, `ssh://`, and local path inputs. The modal install, remove, and update callbacks run the same `packageManager` methods and refresh the row list.

## Disk layout

Packages install under the agent directory, which defaults to `~/.local/share/nexus/agent` and is overridden by `NEXUS_CODING_AGENT_DIR` or `PI_CODING_AGENT_DIR`.

- User scope: `<agentDir>/npm/node_modules/<name>`
- Project scope: `<cwd>/.nexus/npm/node_modules/<name>`

The package entry point is the installed package's `index.ts` or `index.js`, resolved through the package manifest.

## Why disk-only install

Nexus calls `install`, not `installAndPersist`. The persist variant would write to Pi's legacy `packages` settings array, which Nexus does not own. Instead Nexus persists only through the `pi_packages` overlay, and the patched `listConfiguredPackages` reads that overlay back so the modal and CLI see the same configured sources as the loader.

## Loading installed extensions

Installed extensions are loaded by Pi's extension loader through a jiti-based module loader. An installed extension imports `@earendil-works/pi-coding-agent` and `typebox`. In the bundled binary these must resolve to the modules already in the running bundle, so the loader hands jiti an in-memory `virtualModules` map instead of filesystem paths. A filesystem-path alias is computed relative to the loader's `import.meta.url`. That resolves correctly while the loader file lives inside the pi-coding-agent package tree, but it points outside the package when the whole app is a single bundle file at the install root, so the import fails at load time with a "cannot find module" error for a path one level above the install root.

Nexus ships a patch to the pi-coding-agent dependency so the bundled loader uses `virtualModules` in every runtime mode. The patch keeps the mode-specific options that differ across runtimes: `tryNative` disabled under the Bun binary and `tsconfigPaths` enabled in a TypeScript source runtime.

What breaks if it drifts: if the bundled loader resolves installed-extension imports by filesystem path, every installed package fails to load at startup. If a runtime-mode option is dropped, the source or binary runtime loses its correct import behavior.

## Inputs

```ts
type RunInstallCommandInput = {
  source: string; // Package source such as "npm:pi-mcp-adapter".
  local?: boolean; // Install into project scope.
};

type InstalledPackageLocation = {
  userScope: string; // <agentDir>/npm/node_modules/<name>.
  projectScope: string; // <cwd>/.nexus/npm/node_modules/<name>.
};
```

## E2E

| Name | Description |
| --- | --- |
| cli-install-normalizes-source | Installs a bare name as `npm:<name>` and enables it in the overlay. |
| install-disk-only | Installs to the agent directory without writing to Pi's `packages` array. |
| installed-extension-loads | Resolves an installed extension's `@earendil-works/pi-coding-agent` import through the bundle in the installed binary. |
