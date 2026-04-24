---
title: Description Rules
scorers:
  - "project-description: Checks that project descriptions are short and non-repetitive."
  - "app-description: Checks that app descriptions are short and non-repetitive."
  - "package-description: Checks that package descriptions are short and non-repetitive."
  - "leaf-description: Checks that leaf descriptions are short and non-repetitive."
---

- Max 140 chars, explain what the package is. 
- Does not repeat package name.
- Starts with item itself. 
- Examples:
	- Project:
		- `Web app that enabled crypto trading`
		- `Rust backtesting engine`
	- App:
		- `WebApp / CLI that Manages host enrollment and device lifecycle operations so DokOps can join and control one tailnet.`
	- Package:
		- `Provides authentication components` -- No need to add the package name
	- Leaf:
		- `Provisions a new server` -- No need to add the name of the leaf
