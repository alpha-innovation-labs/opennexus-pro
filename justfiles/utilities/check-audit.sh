#!/usr/bin/env bash
# check-audit.sh — Audit one or all @extensions for redundant feature-flag checks.
# Called by check-audit.just.

set -euo pipefail

AUDIT_DIR="${1:-./audit}"
shift || true
mkdir -p "$AUDIT_DIR"

# Write the prompt template to a temp file (avoids just's heredoc parsing issues).
TEMPLATE_FILE=$(mktemp)
cat > "$TEMPLATE_FILE" << 'TEMPLATE_EOF'
You are auditing one extension for redundant feature-flag enable checks.

The extension is: EXTENSION_PLACEHOLDER

## Background

The "feature-flags" package owns "createExtensionRegisterMap()" and "registerBundledExtensions()".
It decides at runtime which extensions load. If an extension is disabled, its code never runs.

This means any internal check an extension makes to see whether it (or a sibling extension) is
enabled is redundant — the feature-flags system already gates loading.

## Your Task

1. Read all source files in "packages/extension-core/EXTENSION_PLACEHOLDER/src/" (recursively).

2. Find every place where the extension:
   - Checks its own enablement status (e.g., isRuntimeExtensionFeatureEnabled("EXTENSION_PLACEHOLDER"))
   - Checks a sibling extension's enablement before executing code
   - Imports a sibling extension's runtime class or function (creating compile-time cross-extension dependencies)
   - Uses isRuntimeExtensionFeatureEnabled(), getEnabledExtensionFeatureFlags(),
     getRegisteredToolRecords(), getAllBundledExtensionIds(), or similar from "@nexus/feature-flags"
     in a way that gates runtime behavior (not just in the feature-management UI itself)

3. For each finding, classify:
   - **own-enablement-check**: The extension checks if it is enabled before running its own code.
     Fix: Remove the check entirely — the extension won't load if disabled.
   - **sibling-import**: The extension statically imports a sibling extension's runtime class/function.
     Fix: Replace with injection (constructor, config object, or callback) wired through
     "registerBundledExtensions()".
   - **type-only**: The import is only a TypeScript "type" import.
     Fix: Safe to keep — type imports are erased at compile time.
   - **legitimate**: The extension legitimately needs to query feature flags for its own internal logic
     (e.g., the feature-management UI extension itself).

4. Output a structured audit in this format:

   ## Audit: <extension-name>

   ### Findings

   | File | What it checks/imports | From where | Classification | Suggested fix |
   |------|----------------------|------------|----------------|---------------|
   | src/file.ts | isRuntimeExtensionFeatureEnabled("hotkeys") | @nexus/feature-flags | own-enablement-check | Remove the check |
   | ... | ... | ... | ... | ... |

   ### Wiring Plan

   List any injection points needed in "registerBundledExtensions()" to replace static imports.

5. Write the audit to: AUDIT_FILE_PLACEHOLDER

6. Do NOT modify any source files. Only read and produce the audit report.

## Key Constraints

- Do NOT change "registerBundledExtensions()"'s external API (its signature). Only change what it passes internally.
- The feature-flags system must remain the single source of truth for what loads.
- Type-only imports are safe and should not be flagged.
- The feature-management extension itself (which shows/edits feature flags in the UI) is exempt from
  the "remove all checks" rule — it legitimately needs to read/write feature flag state.

Now audit EXTENSION_PLACEHOLDER and write the report to AUDIT_FILE_PLACEHOLDER.
TEMPLATE_EOF

# Determine which packages to audit.
if [ $# -gt 0 ]; then
  # Space-separated extension names from just.
  read -ra PKG_ARRAY <<< "$*"
  if [ ${#PKG_ARRAY[@]} -eq 0 ]; then
    echo "No @extensions packages found."
    exit 0
  fi
  PACKAGES=$(printf '%s\n' "${PKG_ARRAY[@]}" | sort -u)
  COUNT=${#PKG_ARRAY[@]}
else
  # All @extensions packages.
  PACKAGES=$(npx turbo ls 2>&1 | grep -E '(@extensions)/' | sed 's/^[[:space:]]*//' | cut -d' ' -f1 | grep -v '^WARNING$' | sort)
  if [ -z "$PACKAGES" ]; then
    echo "No @extensions packages found."
    exit 0
  fi
  COUNT=$(echo "$PACKAGES" | wc -l | tr -d ' ')
fi

echo "=========================================="
echo "Feature-flag audit: $COUNT extension(s)"
echo "=========================================="
echo "Packages:"
echo "$PACKAGES" | sed 's/^/  - /'
echo ""

CURRENT=0
echo "$PACKAGES" | while IFS= read -r pkg; do
  CURRENT=$((CURRENT + 1))
  echo ""
  echo "[$CURRENT/$COUNT] Auditing: $pkg"
  echo "----------------------------------------"

  # Sanitize package name for filenames (replace / with -).
  SAFE_NAME=$(echo "$pkg" | sed 's/@extensions\///g')
  AUDIT_FILE="$AUDIT_DIR/${SAFE_NAME}.md"

  # Build the prompt by substituting placeholders.
  PROMPT_FILE=$(mktemp)
  sed -e "s|EXTENSION_PLACEHOLDER|${SAFE_NAME}|g" \
      -e "s|AUDIT_FILE_PLACEHOLDER|${AUDIT_FILE}|g" \
      "$TEMPLATE_FILE" > "$PROMPT_FILE"

  echo "Running: pi --no-skills --no-session -p < $PROMPT_FILE"
  pi --no-skills --no-session -p "$(cat "$PROMPT_FILE")" < /dev/null

  # Cleanup per-extension prompt file only.
  rm -f "$PROMPT_FILE"

  if [ -f "$AUDIT_FILE" ]; then
    echo "  → Audit written to $AUDIT_FILE"
  else
    echo "  ⚠ No audit file produced — check output above."
  fi
done

echo ""
echo "========================================"
echo "Done. Audited $COUNT packages."
echo "Audit files in: $AUDIT_DIR/"
ls -la "$AUDIT_DIR/"
echo "========================================"

# Final cleanup.
rm -f "$TEMPLATE_FILE"
