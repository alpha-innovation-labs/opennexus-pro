---
title: Input Output Rules
scorers:
  - "leaf-input-output: Checks that leaf docs define typed input and output contracts."
---

Represents the IO that an item expects to receive and return.
Must always use a type structure.

Inputs:
- Must define custom input contracts inline in fenced code blocks.
- Must use the language-native syntax and fenced code language of the owning app, package, or feature.
- Must document constraints that matter to the code contract.

Outputs:
- Must define custom output contracts inline in fenced code blocks.
- Must use the language-native syntax and fenced code language of the owning app, package, or feature.
- Must describe code-level return values, not human-facing CLI formatting.

TS Example:

```ts
type CloudflareDnsCommandInput = {
  zoneId?: string; // Cloudflare zone id
  zoneName?: string; // Cloudflare zone name when id is not provided
  recordName: string; // DNS record name to create or update
};
```

Python example:

```python
import msgspec


class CloudflareDnsCommandInput(msgspec.Struct):
    zone_id: str | None = None  # Cloudflare zone id
    zone_name: str | None = None  # Cloudflare zone name when id is not provided
    record_name: str  # DNS record name to create or update
```

Rust example:

```rust
pub struct CloudflareDnsCommandInput {
    pub zone_id: Option<String>, // Cloudflare zone id
    pub zone_name: Option<String>, // Cloudflare zone name when id is not provided
    pub record_name: String, // DNS record name to create or update
}
```
