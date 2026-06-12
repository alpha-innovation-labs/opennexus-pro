#!/usr/bin/env bash
# Wrapper for zellij-manager that suppresses tsx's deprecated module.register()
# warning (tsx 4.20.3 on Node.js 26+).
export NODE_OPTIONS="--no-deprecation"
exec /opt/homebrew/bin/tsx /Users/alpha/workspace/alpha-innovation-labs/nexus-tui-awesome/e2e_tests/zellij/zellij-manager.ts "$@"
