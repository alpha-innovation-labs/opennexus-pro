# Per-extension audit of redundant feature-flag enable checks.
# Usage: just check-audit [extension-name ...]
#
# If extension names are provided, audits only those extensions.
# Otherwise, audits all @extensions packages one at a time,
# spawning a separate pi agent for each.
#
# Each agent writes its analysis to ./audit/<extension-name>.md.

check-audit PACKAGES:
    bash ./justfiles/utilities/check-audit.sh "./audit" {{PACKAGES}}
