#!/usr/bin/env python3
"""
codegraph-tree.py — Build a call hierarchy tree for the entire codebase.

Uses `codegraph node` (fast, ~0.2s per call) instead of `codegraph callers`
(~2s per call), and parallelizes with threads.
"""

import json
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


PROJECT_DIR = str(Path(__file__).parent.parent.resolve())


def run_codegraph(command: str, *args: str) -> str:
    """Run a codegraph subcommand and return stdout (stderr suppressed)."""
    try:
        result = subprocess.run(
            ["codegraph", command, "-p", PROJECT_DIR, *args],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return result.stdout
    except Exception:
        return ""


def _parse_node_callers(text: str) -> list[dict]:
    """Parse 'Called by ←' line from `codegraph node` output.

    Format: **Called by ←** name (file:line), name2 (file2:line2), ...
    Returns list of dicts with name, kind='function', filePath, startLine.
    """
    pattern = r"\*\*Called by ←\*\*\s*(.+)"
    m = re.search(pattern, text)
    if not m:
        return []

    parts = m.group(1).split(", ")
    callers = []
    for part in parts:
        part = part.strip()
        # Skip file-level imports (name ends with .ts/.tsx/.js etc.)
        if re.search(r"\.(ts|tsx|js|jsx|mjs)$", part):
            continue
        # Parse "name (file:line)" or "name (file)" or "name"
        loc_m = re.match(r"(.+?)\s+\((.+?)\)$", part)
        if loc_m:
            name = loc_m.group(1).strip()
            loc = loc_m.group(2).strip()
            file_m = re.match(r"(.+?):(\d+)$", loc)
            if file_m:
                callers.append({
                    "name": name,
                    "kind": "function",
                    "filePath": file_m.group(1),
                    "startLine": file_m.group(2),
                })
            else:
                callers.append({"name": name, "kind": "function"})
        else:
            callers.append({"name": part, "kind": "function"})

    return callers


def _get_callers_for(symbol: str) -> list[dict]:
    """Get callers of a symbol using `codegraph node` (fast)."""
    raw = run_codegraph("node", "-p", PROJECT_DIR, symbol)
    if not raw:
        return []
    return _parse_node_callers(raw)


def get_exported_symbols() -> list[dict]:
    """Get all exported function-level symbols in the codebase."""
    raw = run_codegraph(
        "query", "--kind", "function", "--json", "", "-k", "function", "-l", "10000"
    )
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if not isinstance(data, list):
            return []
        symbols = []
        for item in data:
            node = item.get("node", item)
            if node.get("isExported", False):
                symbols.append(node)
        return sorted(symbols, key=lambda x: x.get("filePath", "") + x.get("name", ""))
    except (json.JSONDecodeError, KeyError):
        return []


def _build_caller_map(symbols: list[dict]) -> dict[str, list[dict]]:
    """Pre-build a caller map in parallel using `codegraph node` (~0.2s/call)."""
    caller_map: dict[str, list[dict]] = {}

    def _query(name: str) -> tuple[str, list[dict]]:
        callers = _get_callers_for(name)
        return (name, callers)

    with ThreadPoolExecutor(max_workers=20) as pool:
        futures = {pool.submit(_query, s.get("name", "")): s.get("name", "") for s in symbols if s.get("name")}
        for future in as_completed(futures):
            name, callers = future.result()
            caller_map[name] = callers

    return caller_map


def _collect_callers_upward(
    symbol: str,
    caller_map: dict[str, list[dict]],
    visited: set[str],
) -> list[dict[str, str | None]]:
    """Walk upward from a symbol, collecting all caller branches.

    Returns a list of dicts with 'name' and optional 'loc' (file:line).
    Only returns the first chain to avoid combinatorial explosion,
    since most symbols have one dominant caller path.
    """
    if symbol in visited:
        return []
    visited.add(symbol)

    callers = caller_map.get(symbol, [])
    if not callers:
        return [{"name": symbol, "loc": None}]

    for caller in callers:
        c_name = caller.get("name", "")
        c_kind = caller.get("kind", "")
        c_file = caller.get("filePath", "")
        c_line = caller.get("startLine", "")

        if c_kind != "function" or c_name == symbol:
            continue

        loc = f"{c_file}:{c_line}" if c_file and c_line else None
        chain = _collect_callers_upward(c_name, caller_map, visited)
        if chain:
            return chain + [{"name": symbol, "loc": loc}]

    return [{"name": symbol, "loc": None}]


def _render_chain(
    chain: list[dict[str, str | None]],
) -> None:
    """Print a chain from entry point (top) to leaf (bottom)."""
    for i, node in enumerate(chain):
        is_last = i == len(chain) - 1
        connector = "└─" if is_last else "├─"
        loc = node.get("loc")
        loc_str = f" — {loc}" if loc else ""
        print(f"  {connector} {node['name']}() {loc_str}".rstrip())


def main() -> None:
    symbols = get_exported_symbols()

    # Pre-build caller map in parallel using `codegraph node` (~0.2s/call)
    caller_map = _build_caller_map(symbols)

    for s in symbols:
        s_name = s.get("name", "")
        if not s_name:
            continue
        print()
        print(f"--- {s_name} ---")
        chain = _collect_callers_upward(s_name, caller_map, set())
        _render_chain(chain)


if __name__ == "__main__":
    main()
