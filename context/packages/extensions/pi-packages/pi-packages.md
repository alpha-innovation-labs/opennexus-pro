---
language: ts
---

Manages third-party Pi packages for Nexus. It installs npm packages into the agent directory, tracks a per-user enable overlay, and exposes the result both to the interactive `/pi-packages` modal and to the `nexus install` CLI command. Enablement is stored in the Nexus user config and converted into Pi's package list at boot so the loader picks the packages up without Nexus owning Pi's settings file.

## Features
- [[features/command/register-pi-packages-command|register-pi-packages-command]]: Registers the `/pi-packages` command that opens the package management modal.
- [[features/ui/show-pi-packages-modal|show-pi-packages-modal]]: Renders the two-tab modal that lists configured packages, toggles them, and installs, removes, or updates packages.
- [[features/package/persist-package-enable-state|persist-package-enable-state]]: Stores the per-user enable overlay and converts it into Pi's `packages` list at boot.
- [[features/package/install-package|install-package]]: Installs, removes, and updates packages through Pi's package manager and loads them from the agent directory.

## File Structure
```text
src/
  command/
    showPiPackagesModal.ts
  model/
    createThirdPartyManagedExtensionRows.ts
    sortManagedExtensionRows.ts
    types.ts
    updateManagedExtensionRows.ts
  package/
    createConfiguredPackageRows.ts
    createNexusPackageManager.ts
    createPackageSource.ts
    fetchNpmPackageSearchRows.ts
    normalizeNpmPackageName.ts
  registerPiPackagesExtension.ts
  ui/
    PiPackagesCallbacks.ts
    PiPackagesModal.ts
    colorManagedExtensionStatus.ts
    createManagedExtensionItems.ts
    createPiPackagesHeader.ts
    filterManagedExtensionRows.ts
    formatManagedExtensionRow.ts
    formatPiPackagesTabs.ts
    getManagedExtensionColumnWidth.ts
    getManagedExtensionGroupLabel.ts
    getNextPiPackagesTab.ts
    getPiPackagesHeaderWidth.ts
    isPiPackagesTextInput.ts
    padManagedExtensionColumn.ts

apps/tui/src/cli/install/
  createNexusCliPackageManager.ts
  getPiPackageNameFromUrl.ts
  isInstallCommand.ts
  isLikelyNpmPackageName.ts
  normalizeInstallSource.ts
  parseInstallCommand.ts
  printInstallUsage.ts
  runInstallCommand.ts
```
