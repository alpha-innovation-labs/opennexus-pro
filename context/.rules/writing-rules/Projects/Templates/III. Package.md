---
title: Package Template
scorers:
  - "package-template: Checks that package docs follow the required package template shape."
  - "package-meta: Checks that package docs declare the required metadata fields."
---

```text
---
language: <py, ts, rs>
---

<description as per [[../Rules/I. Description|I. Description]]>

## Features
  - [[features/<feature>/<leaf>|<leaf>]]: <one-line summary>

## Shared (Optional)
  - [[shared/<feature>/|<feature>]]: <one-line summary>


## File Structure
<code app layout as per [[../Rules/File Structure|File Structure]]>

## Recipes (optiona)
<recipes as per [[../Rules/VIII. Recipes|VIII. Recipes]]>
