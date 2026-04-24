---
title: Language Specific Rules
scorers:
  - "app-language-specific-rules: Checks that app docs follow language-specific documentation rules."
  - "package-language-specific-rules: Checks that package docs follow language-specific documentation rules."
  - "feature-language-specific-rules: Checks that feature docs follow language-specific documentation rules."
---

#### React

For React apps and React-facing features, add a `stories/` folder next to feature-owned `types/`.
Use this structure:

```text
features/
  <feature-name>/
    <leaf-name>.md
    <leaf-name>/
      <leaf-name>.tsx
      <leaf-entry-file>
      types/
        <FeatureInput>.ts
        <FeatureResult>.ts
      stories/
        <feature-name>.stories.tsx
      e2e/
        <scenario-test-file>
```

Rules:

- Use the JSX-capable extension required by the project for React-rendering files and stories, such as `tsx` or `jsx`.
- Each major React feature must have its own Storybook stories.
- Stories must live under that feature's `stories/` folder.
- Story files must be owned by the feature they document.
- Do not centralize unrelated stories into one shared story file.
