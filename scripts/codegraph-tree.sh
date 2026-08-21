#!/usr/bin/env bash
#
# codegraph-tree.sh — Build a call hierarchy tree from CodeGraph data.
#
# Usage:
#   scripts/codegraph-tree.sh [--package <path>] [--symbol <name>] [--dead-code] [--json]
#
# Examples:
#   scripts/codegraph-tree.sh --package packages/factory/src
#   scripts/codegraph-tree.sh --symbol findNodes
#   scripts/codegraph-tree.sh --package packages/factory/src --dead-code
#   scripts/codegraph-tree.sh --symbol runFactoryCommand --json

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CG_PATH="-p $PROJECT_DIR"

# ── Defaults ──────────────────────────────────────────────────────────────────
PACKAGE=""
SYMBOL=""
DEAD_CODE=0
JSON_OUT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --package)  PACKAGE="$2";   shift 2 ;;
    --symbol)   SYMBOL="$2";    shift 2 ;;
    --dead-code) DEAD_CODE=1;  shift   ;;
    --json)     JSON_OUT=1;    shift   ;;
    -h|--help)
      echo "Usage: $0 [--package <path>] [--symbol <name>] [--dead-code] [--json]"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── Helpers ───────────────────────────────────────────────────────────────────

# Get callers of a symbol as JSON, filtering out file-level imports
get_callers() {
  local sym="$1"
  codegraph callers $CG_PATH -j "$sym" 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for c in data.get('callers', []):
        if c.get('kind') == 'function':
            print(json.dumps(c))
except:
    pass
" || true
}

# Get callees of a symbol as JSON
get_callees() {
  local sym="$1"
  codegraph callees $CG_PATH -j "$sym" 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for c in data.get('callees', []):
        if c.get('kind') in ('function', 'method', 'class', 'type_alias'):
            print(json.dumps(c))
except:
    pass
" || true
}

# Get all exported symbols from a package
get_exported_symbols() {
  local pkg="$1"
  codegraph files $CG_PATH --filter "$pkg" --format flat --json 2>/dev/null | python3 -c "
import json, sys, os
try:
    data = json.load(sys.stdin)
    symbols = []
    def walk(node, depth=0):
        if isinstance(node, dict):
            if 'symbols' in node:
                for s in node['symbols']:
                    if s.get('isExported', False):
                        symbols.append(s)
            for v in node.values():
                walk(v, depth+1)
    walk(data)
    for s in sorted(symbols, key=lambda x: x.get('filePath','') + x.get('name','')):
        print(json.dumps(s))
except:
    pass
" || true
}

# ── Tree building (recursive) ─────────────────────────────────────────────────

# Build a tree starting from a symbol, tracing callers upward.
build_tree() {
  local sym="$1"
  local indent="$2"
  local visited_file="$3"

  # Cycle detection
  if grep -qxF "$sym" "$visited_file" 2>/dev/null; then
    return
  fi
  echo "$sym" >> "$visited_file"

  # Get real callers (functions, not file-level imports)
  local callers_json
  callers_json=$(get_callers "$sym")

  if [ -z "$callers_json" ]; then
    echo "${indent}└─ $sym"
    return
  fi

  # Print this symbol
  echo "${indent}└─ $sym"

  # For each caller, recurse
  while IFS= read -r caller; do
    [ -z "$caller" ] && continue
    local c_name c_kind c_file c_line
    c_name=$(echo "$caller" | python3 -c "import json,sys; print(json.load(sys.stdin).get('name',''))" 2>/dev/null || echo "")
    c_kind=$(echo "$caller" | python3 -c "import json,sys; print(json.load(sys.stdin).get('kind',''))" 2>/dev/null || echo "")
    c_file=$(echo "$caller" | python3 -c "import json,sys; print(json.load(sys.stdin).get('filePath',''))" 2>/dev/null || echo "")
    c_line=$(echo "$caller" | python3 -c "import json,sys; print(json.load(sys.stdin).get('startLine',''))" 2>/dev/null || echo "")

    # Skip file-level imports and callers that match current symbol (self-reference)
    [ "$c_kind" != "function" ] && continue
    [ "$c_name" = "$sym" ] && continue

    local loc=""
    if [ -n "$c_file" ] && [ "$c_line" != "" ]; then
      loc=" — ${c_file}:${c_line}"
    fi

    echo "${indent}  ├─ ${c_name}()${loc}"
    build_tree "$c_name" "${indent}  │  " "$visited_file"
  done <<< "$callers_json"
}

# ── Dead code detection ───────────────────────────────────────────────────────

find_dead_code() {
  local pkg="$1"
  local dead_found=0

  get_exported_symbols "$pkg" | while IFS= read -r sym_json; do
    [ -z "$sym_json" ] && continue
    local s_name s_file s_kind
    s_name=$(echo "$sym_json" | python3 -c "import json,sys; print(json.load(sys.stdin).get('name',''))")
    s_file=$(echo "$sym_json" | python3 -c "import json,sys; print(json.load(sys.stdin).get('filePath',''))")
    s_kind=$(echo "$sym_json" | python3 -c "import json,sys; print(json.load(sys.stdin).get('kind',''))")

    [ -z "$s_name" ] && continue

    # Check who calls this symbol
    local callers
    callers=$(get_callers "$s_name")

    # If no real callers (only file-level imports), it's dead code
    local real_callers
    real_callers=$(echo "$callers" | python3 -c "
import json, sys
data = json.load(sys.stdin)
real = [c for c in data.get('callers', []) if c.get('kind') == 'function']
print(len(real))
" 2>/dev/null)

    if [ "$real_callers" = "0" ]; then
      dead_found=1
      echo "  $s_kind: $s_name — $s_file"
    fi
  done
}

# ── JSON output mode ──────────────────────────────────────────────────────────

run_json() {
  local sym="$1"
  echo "$sym" | python3 -c "
import json, sys
sym = sys.stdin.read().strip()
# Just output the symbol info
" 2>/dev/null
}

# ── Main ──────────────────────────────────────────────────────────────────────

if [ -n "$PACKAGE" ]; then
  if [ "$DEAD_CODE" -eq 1 ]; then
    echo "=== Dead Code in $PACKAGE ==="
    find_dead_code "$PACKAGE"
  else
    # Build tree from all exported symbols
    echo "=== Call Tree for $PACKAGE ==="
    get_exported_symbols "$PACKAGE" | while IFS= read -r sym_json; do
      [ -z "$sym_json" ] && continue
      local s_name
      s_name=$(echo "$sym_json" | python3 -c "import json,sys; print(json.load(sys.stdin).get('name',''))")
      [ -z "$s_name" ] && continue

      local visited
      visited=$(mktemp)
      echo "$s_name" > "$visited"

      echo ""
      echo "--- $s_name ---"
      build_tree "$s_name" "  " "$visited"
      rm -f "$visited"
    done
  fi
elif [ -n "$SYMBOL" ]; then
  echo "=== Call Tree: $SYMBOL ==="
  echo ""
  build_tree "$SYMBOL" "" "$(mktemp)"
else
  echo "Error: specify --package <path> or --symbol <name>"
  exit 1
fi
