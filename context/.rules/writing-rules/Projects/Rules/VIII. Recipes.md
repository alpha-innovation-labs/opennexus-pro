---
title: Recipe Rules
scorers:
  - "project-recipes: Checks that project docs list the expected justfile recipes."
  - "app-recipes: Checks that app docs list the expected justfile recipes."
  - "package-recipes: Checks that package docs list the expected justfile recipes."
  - "leaf-recipes: Checks that leaf docs list the expected justfile recipes."
---

- They are `justfile` recipes.
- List one bullet per expected `justfile` recipe in the owning doc.
- Recipe docs are valid only when they document a concrete `justfile` recipe owned by a feature or shared surface.
- Each recipe bullet must start with the full `just` invocation in the format `just <surface>`.
- Prefer concrete command surfaces such as `just cli dokops server` over abstract recipe labels.
- If a certain recipe is directed at a package only, do not rewrite it in the app
	- Meaning that app recipes are global and can't be done from a single package


Examples:
- In App:
	- `just cli`
- In Package context:
	- `just cli dokops context create`
