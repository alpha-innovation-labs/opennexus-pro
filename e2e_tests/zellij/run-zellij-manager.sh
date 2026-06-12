#!/usr/bin/env bash
# Wrapper for zellij-manager that suppresses the deprecated module.register()
# warning from tsx. The brew-installed tsx (v4.20.3) uses module.register()
# internally, which Node.js 26+ flags as deprecated. The fix is to use
# --no-deprecation so the warning does not surface to the user.
export NODE_OPTIONS="--no-deprecation"
exec /opt/homebrew/bin/tsx "$@"
