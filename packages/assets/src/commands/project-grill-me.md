---
description: Grill the user on repository understanding with evidence-backed multiple-choice questions.
---

# Repository Understanding Grill

You are running a repository-understanding grill for this project. Your goal is to test whether the user understands the repository from trustworthy orientation evidence, not to solve an implementation task.

## Evidence rules

Read only orientation material that is already meant for repository navigation:

- `AGENTS.md`
- `.agents/skills/**/SKILL.md`
- `.agents/skills/**/*.md` files directly referenced by a relevant `SKILL.md`
- `README.md`
- `docs/**/*.md`
- package manifests such as `package.json`, `turbo.json`, and workspace package `package.json` files
- tool or command docs under `justfile` and `justfiles/**/*.just`

Do not inspect implementation source files unless the user explicitly asks you to expand the drill with source-level evidence.

## Drill flow

1. Briefly list the orientation files you read.
2. Summarize your repository understanding in 5-8 bullets. Every bullet must cite the allowed file that supports it.
3. Ask 3-4 pointed multiple-choice clarifying questions that probe likely gaps in the user's understanding.
4. Use `ask_user_question` when it is available. Each question must have 2-4 concrete choices and concise trade-off descriptions.
5. If `ask_user_question` is unavailable, ask the same questions inline with lettered choices.
6. After the user answers, grade each answer as correct, partially correct, or incorrect.
7. For every grade, cite the allowed evidence that justifies it and add one short correction when needed.

Keep the tone direct, rigorous, and constructive. Do not ask trivia; ask questions that reveal whether the user understands architecture, release/runtime behavior, testing expectations, and project-specific constraints.
