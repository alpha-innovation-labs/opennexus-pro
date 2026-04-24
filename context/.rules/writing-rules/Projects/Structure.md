---
scorers:
  - "project-top-level-layout: Checks the allowed project-level directories and markdown docs."
  - "apps-layout: Checks that apps/ contains app directories only."
  - "app-index-doc: Checks that every app root contains its index markdown doc."
  - "app-default-directories: Checks that every app root contains shared and features."
  - "app-root-allowed-entries: Checks that app roots only contain allowed docs and folders."
  - "package-layout: Checks package and package-group directory layout under packages/."
  - "package-index-doc: Checks that every package root contains its index markdown doc."
  - "package-default-directories: Checks that every package root contains shared and features."
  - "package-root-allowed-entries: Checks that package roots only contain allowed docs and folders."
  - "reference-structure: Checks that each existing reference root has distilled markdown and optional non-empty raw sources."
  - "reference-raw-layout: Checks raw reference naming and markdown-only file layout."
  - "shared-leaf-structure: Checks that shared directories contain markdown-bearing leaf directories only."
  - "shared-leaf-markdown-only: Checks that shared leaf directories contain markdown files only."
  - "feature-structure: Checks that features contain non-reference markdown content."
  - "app-entrypoint-semantics: Uses an LLM judge to check that app docs describe runnable entrypoints."
  - "package-single-purpose-semantics: Uses an LLM judge to check that each package stays focused on one thing."
  - "shared-reuse-semantics: Uses an LLM judge to check that shared leaves appear reusable across features."
  - "feature-leaf-semantics: Uses an LLM judge to check that feature leaves look like single actionable units."
---

This file describes how files are going to be created inside the [[../../../projects/Projects|Projects]] folder
It is means as guideline for the type of md files to create, and well as the default tempalte for each

## Project Structure

```text
apps/
  <app-name>/
    <default-structure>
packages/
  <package-group>/
    <package-name>/
		<default-structure>		
```

Where `default-structure` is:

```
<package/app-name>.md
[optional] <reference-structure>
shared/
	<leaf-name>/
		<leaf.md>
features/
	<feature-name>/
		[optional] <reference-structure>
		<leaf>.md

```

And an optional `reference-structure` looks like:

```txt
reference/
	raw/
		<raw-reference>.md
	<distilled_reference_information>.md
```

### Example
```
apps/
	cli/
		cli.md
		reference/
			raw/
				cli-toolkit-complete-surface.md
			cli-toolkit.md	
		shared/
			defaults/
				types.md
		features/
			tui/
				reference/
					raw/
						ratkit-docs.md
					ratkit_usage.md		
				layout/
					pane.md
					input.md
			hcloud/
				server/
					create.md
					delete.md
					server-types.md
packages/
	infra/
			hcloud/
			hcloud.md
			reference/
				raw/
					hcloud.md
				hcloud_cli.md
			shared/
				defaults/
					types.md
			features/
				server/
					create.md
					delete.md
					server-type.md
```

### Definitions

- `apps/` contains runnable application entrypoints. **Examples**: CLI, web app, worker, API server.
- `packages/` contains focused code units. Each package must do one thing only. 
	- `package-group` is optional. Examples: `db` which groups `clickhouse`, `redis` etc...
- `features/` are unique groups functionalities
	- A `leaf` is a self contained piece of code that does one job and one job only. It can either be used in a cli or app call, or imported in a broader structure as most code is.
	- One leaf must represent exactly one command, one callable unit, or one imported function.
	- A command group or routing hub is not a leaf. It is a feature-level grouping surface.
	- If a human-facing surface exposes multiple actionable sibling commands, document one leaf per command.
- `reference/` stores feature-local supporting material needed to implement the feature that are from third party sources, docs or APIs. 
	- `reference/` folders are optional.
	- Raw references use one stable file per external item by default, such as `raw/hcloud.md`.
	- If one external item truly needs multiple raw files, place them under `raw/<item>/`.
	- Read more on [[Rules/X. References|X. References]]
- `shared/` represent leaf code that is shared across multiple features. 
