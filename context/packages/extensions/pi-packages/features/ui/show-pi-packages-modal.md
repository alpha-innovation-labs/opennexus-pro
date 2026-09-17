Renders the Pi packages modal. It shows two tabs (All and Third-party), lists configured packages with their enable state, and drives the install, remove, update, toggle, and npm search actions for the current session.

## Behavior

The modal renders configured package rows through a `SelectPreviewModal`. The All tab shows every configured package; the Third-party tab shows only third-party rows and adds live npm search. Tab switching uses Tab and Shift+Tab. Enter or Space toggles the selected row. On the Third-party tab, `d` removes the selected package, `u` updates it, and `/` opens search mode, which queries the npm registry as the user types and installs the selected result on Enter.

Search rows and configured rows share one list. Search rows render above configured rows while the query is active, and a search row is installable while a configured row is toggles. The modal refreshes its rows through callbacks supplied by the command handler so the persisted state stays in sync with what is displayed.

## Inputs

```ts
type ShowPiPackagesModalInput = {
  ctx: ExtensionCommandContext; // Provides UI, cwd, and notify.
};

type PiPackagesCallbacks = {
  onUpdate: (extensionId: string, enabled: boolean) => ManagedExtensionRow[];
  onInstallPackage: (source: string) => Promise<ManagedExtensionRow[]>;
  onRemovePackage: (source: string) => Promise<ManagedExtensionRow[]>;
  onUpdatePackage: (source: string) => Promise<ManagedExtensionRow[]>;
  onSearchPackages: (query: string, currentRows: ManagedExtensionRow[]) => Promise<ManagedExtensionRow[]>;
};
```

## Outputs

The modal closes with `undefined`. Its callbacks persist changes through the [[features/package/persist-package-enable-state|enable overlay]] and the [[features/package/install-package|package install flow]] and return refreshed rows for re-render.

## E2E

| Name | Description |
| --- | --- |
| pi-packages-tab-switching | Switches between the All and Third-party tabs and rebuilds the row list. |
| pi-packages-toggle | Toggles the selected package enabled state and refreshes the row. |
| pi-packages-npm-search | Queries the npm registry on the Third-party tab and installs the selected search result. |
| pi-packages-install-remove-update | Installs, removes, and updates a selected package and refreshes the list. |
