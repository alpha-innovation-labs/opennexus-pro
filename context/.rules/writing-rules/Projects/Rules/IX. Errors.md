---
title: Error Rules
scorers:
  - "leaf-errors: Checks that operational leaf docs define typed error contracts."
---

Operational leaves must define typed error contracts.

Applies to app leaves and package leaves that can fail during execution.

Rules:
- Must define errors inline in a fenced code block.
- Must use the language-native syntax and fenced code language of the owning app, package, or feature.
- Must model code-level error cases, not human-facing CLI rendering.
- App leaves may format these errors for humans, but package leaves must only expose typed errors.
- Pure contract-only leaves may omit the `Errors` section when they cannot fail.

Rust example:

```rust
pub enum HcloudServerCreateError {
    HcloudCliReady(HcloudCliReadyError), // Local hcloud CLI is not ready
    ServerAlreadyExists(String), // A server with the requested name already exists
    Provider(String), // Provider execution failed
}
```
