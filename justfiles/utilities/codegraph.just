# CodeGraph analysis helpers.
# Usage: just codegraph
#
# Builds a call hierarchy tree for every exported symbol across the entire codebase.

codegraph:
    python3 scripts/codegraph-tree.py
