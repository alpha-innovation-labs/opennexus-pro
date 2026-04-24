---
title: Reference Rules
scorers:
  - "project-references: Checks that project docs link to valid reference notes."
  - "app-references: Checks that app docs link to valid reference notes."
  - "package-references: Checks that package docs link to valid reference notes."
  - "leaf-references: Checks that leaf docs link to valid reference notes."
  - "reference-references: Checks that reference trees contain valid raw and distilled reference notes."
  - "reference-template: Checks that reference notes follow the required raw or distilled template shape."
  - "reference-meta: Checks that reference notes declare the required metadata fields."
---

## Key pieces
### Reference Folder
- `reference/` stores only external source material for one feature.
	- Never place internal docs, local notes, or internal mappings there.
	- Use any working format: Markdown, text, JSON, CLI help, or web notes.
	- We must have one canonical reference location for a particular item. For example, `aws` reference must be in a single location across the entire project.
		- It is not allowed to have mutliple reference location talking about different parts of `aws`

### Raw folder
- Keep a `raw/` folder with source snapshots grouped by topic.
	- Raw notes may include the exact capture commands used to retrieve the external source.
	- Raw references must use one stable file per external item by default.
	- If one external item truly needs multiple raw files, place them under `raw/<item>/`.
	- Update the same reference files to the latest external version when the source changes.

### Reference Note
- Reference notes must:
	- start with **YAML frontmatter**:
		- `title` of what the note is about
		- `version` is the latest version of the reference we are workgin with. For example, the latest version of the cli tool, or api docs
			- record the source version or revision there when the source provides one
			- CLI references must record the CLI version used for capture there
		- `updated` the time when we last updated this document
			- Formatted as  `<YYYY-MM-DD>`
		- `source` is the location, url etc... of the reference
	- Have a `Breaking Changes` section
		- Saw we were on version 0.1.3, but now there is a new version 0.1.4
		- This section is responsible to document the changes between these 2 versions

### Distilled note
-  Every `reference/` must contain distilled summaries of `raw/` content. Rules for these notes are:
	- Located next to `raw/`, outside the `raw/` folder.
	- Must be a high level overview of the ONLY surfaces relevant to our app or package.
	- Must read like a guide for someone who wants to know how to use that particular reference item, without needing to read the entire relevant docs, or trying to play with the relevant cli
	- Must be named as `<reference>-distilled`
		- where reference is the API, tool, app etc... that is being referenced
	- Required sections:
		- Must start with an `Overview` section that briefly explains the context in which the reference is used
		- `Distilled information` 
			- Each item is a particular usage our app/package needs
			- Contains subietms for any relevant inputs, outputs etc... needed to get the job done

## Examples

###  Folders
```text
features/
	hcloud/
		reference/
			raw/
				hcloud-cli-usage.md
			hcloud-distilled.md
	cloudflare/
		reference/
			raw/
				cloudflare-api-docs.md
			cloudflare-distilled.md	
```


### Reference Note

#### API example

```md
---
title: Cloudflare API V2 docs
version: 1.62.0
updated: 2026-04-14
source: https://developers.cloudflare.com/api/
---

## Source Capture

## Breaking Changes:

### From version 1.60.0
- Username are no longer strings
- ...
```

#### CLI example

```md
---
title: Hcloud CLI usage
version: 0.4.2
updated: 2026-04-14
source: `hcloud`
---

## Source Capture

### Commands

hcloud version
hcloud --help
hcloud server --help
hcloud context list --help

## Breaking Changes:
....

```


### Distilled Notes

```md
---
title: Hcloud CLI usage
version: 0.4.2
updated: 2026-04-14
---

## Overview

This is a reference information for how to use the `hcloud` cli to interact with Hetzner.

### Distilled information:

- Fetching list of servers:
  - run `hcloud server list` 
  - inputs:
	  - pass `--name` for the name of the server
	  - pass `--server` with a type that you can get from hcloud server types
  - outputs:
	  - succes: ...
	  - failure: ...
```
