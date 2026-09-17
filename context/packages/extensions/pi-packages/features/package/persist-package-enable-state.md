Stores the per-user package enable overlay and converts it into Pi's package list at boot. Nexus keeps its own enable state separate from Pi's settings file and bridges the two with a runtime patch.

## Enable overlay

Each package is stored as a flat boolean under `extensions.pi_packages` in the Nexus user config, keyed by the package source string.

```jsonc
{
  "extensions": {
    "pi_packages": { "npm:pi-chrome": true, "npm:pi-mcp-adapter": false }
  }
}
```

`setUserExtensionEnabled` writes one key and drops the `extensions` object entirely when the map becomes empty. `removeUserExtensionConfig` deletes a key and prunes `pi_packages` and `extensions` the same way. A source set to `false` is a deliberate disable, not an absence.

## Conversion to Pi's package list

Pi's resolver reads `globalSettings.packages` as an array of source strings. Nexus does not write that array itself. Instead, `applyNexusConfigPatch` wraps the Pi `SettingsManager.fromStorage` factory so that every settings manager it produces carries a patched `getGlobalSettings`. The patch reads the user config, takes every `pi_packages` entry whose value is truthy, appends it to `globalSettings.packages`, and clears `globalSettings.extensions`. Entries set to `false` are skipped so Pi never resolves or loads them.

The patch also merges the bundled app defaults into the global settings before the conversion. It is idempotent: the factory records a `__nexusConfigPatched__` flag and installs the wrapper once.

## Why the split

Nexus manages package enablement in its own config and leaves Pi's file-based settings untouched. The patch runs on top of Pi's normal settings loading rather than replacing it, so Pi still reads its own files and the only intercepted call is `getGlobalSettings`. Because `getGlobalSettings` returns a structured clone, the converted array is injected into the returned object rather than mutated in place.

What breaks if it drifts: if the patch is not applied before the loader resolves packages, the `pi_packages` overlay is invisible to Pi and no third-party package loads. If a `false` entry leaks into the package list, a disabled package loads.

## Inputs

```ts
type SetUserExtensionEnabledInput = {
  packageSource: string; // Package source such as "npm:pi-chrome".
  enabled: boolean;
};

type NexusUserConfigExtensions = {
  pi_packages?: Record<string, boolean>; // Source string to enabled state.
};
```

## E2E

| Name | Description |
| --- | --- |
| enable-overlay-persist | Writes and removes a `pi_packages` entry and prunes the config when it empties. |
| config-patch-converts-packages | Converts truthy `pi_packages` entries into `globalSettings.packages` and clears `extensions`. |
| config-patch-skips-disabled | Leaves `false` entries out of the converted package list. |
