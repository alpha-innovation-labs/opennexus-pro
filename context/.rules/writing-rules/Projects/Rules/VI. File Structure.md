---
title: File Structure Rules
scorers:
  - "app-template: Checks that app docs include a valid File Structure section and required template sections."
  - "package-template: Checks that package docs include a valid File Structure section and required template sections."
---

- Must show the intended final **code** structure.
- Must respect the project md structure.
- Must not contain any `.md` files.
- Must use the file extension defined by the project or app `language` meta.
- Must use the correct language root entry, for example `index.ts` for TypeScript.
- Feature folders should include a `reference/` directory for supporting docs and captured external command help.
- The file tree may show the `reference/` directory, but should not list documentation files inside it.
- Reference items must include capture date and source version or revision.
- Raw references should use one stable file per external item, such as `raw/hcloud.md`.
- Only split one external item into `raw/<item>/` when that item truly needs multiple raw files.

Example:

```
packages/
  infra/
    tailscale/
      shared/
        e2e/
          bootstrap.spec.ts
      features/
        host/
          reference/
            raw/
          index.ts
          prepare.ts
          types/
            TailscaleHostPrepareInput.ts
          e2e/
            prepare.spec.ts
        device/
          index.ts
          list.ts
          types/
            TailscaleDeviceListInput.ts
            TailscaleDeviceListOutput.ts
          e2e/
            list.spec.ts
```
