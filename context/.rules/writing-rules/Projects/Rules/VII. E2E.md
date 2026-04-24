---
title: E2E Rules
scorers:
  - "project-e2e: Checks that project docs list the expected scenario-level E2E coverage."
  - "app-e2e: Checks that app docs list the expected scenario-level E2E coverage."
  - "package-e2e: Checks that package docs list the expected scenario-level E2E coverage."
  - "leaf-e2e: Checks that leaf docs list the expected scenario-level E2E coverage."
---

- Describe the real scenario-level behaviors the module must prove.
- If a module exposes actionable user or system flows, it must document those flows.
- Prefer complete E2E coverage over partial or implied coverage.
- List one bullet per documented E2E scenario in the owning doc.
- If a scenario proves shared behavior or spans more than one leaf, document it from `shared.md`.
- Format should be in a table where col 1 is the test name, and col 2 is the test description
	- Note that in the file tree, the test file names follows the col 1 test name

Example:

| Name          | Description                               |
| ------------- | ----------------------------------------- |
| server_create | must be able to create a server           |
| server_delete | must be able to delete an existing server |
