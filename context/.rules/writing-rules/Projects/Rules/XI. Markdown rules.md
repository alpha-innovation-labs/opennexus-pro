---
title: Markdown Rules
scorers:
  - "project-markdown: Checks that project docs follow markdown formatting rules."
  - "app-markdown: Checks that app docs follow markdown formatting rules."
  - "package-markdown: Checks that package docs follow markdown formatting rules."
  - "leaf-markdown: Checks that leaf docs follow markdown formatting rules."
  - "reference-markdown: Checks that reference docs follow markdown formatting rules."
---

#### Link Rules

- Prefer relative wikilinks within the same app or package subtree.
- From an app/package index, link to leaves as `[[features/<feature>/<leaf>|<leaf>]]` or `[[features/<domain>/<leaf>|<leaf>]]`.

#### Line Break Rules

- Do not hard-wrap normal prose across multiple physical lines.
- Write each paragraph as a single physical markdown line.
- Write each bullet item as a single physical markdown line unless the content is a code block.
- Avoid random continuation lines that break one sentence into multiple markdown lines.
- These line-break rules apply to project, app, package, feature, e2e, and recipe docs unless a more specific rule overrides them.

#### Table Rules

Be careful with `|` inside table cells.

- In tables, use bare embeds like `![[TypeName]]` when the type name is unique.
- Do not use aliased wikilinks like `[[path|label]]` inside table cells.
- Do not write `[[path | label]]` inside a table cell.
- Do not leave trailing empty columns in a table.
- If a type expression contains `|`, do not put that raw union inside a table cell unless it is escaped or rewritten.
