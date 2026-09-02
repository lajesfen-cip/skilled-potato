#!/usr/bin/env python3
"""Deterministic function/class scanner for the rescan-index skill.
Walks the repo, regex-matches function/class declarations per file extension,
and prints a JSON array of {file, line, name, kind, signature} to stdout.
Descriptions and the "reusable" flag are NOT produced here -- that's left to
the skill's LLM step, since it requires reading and understanding the code.
"""

import json
import os
import re
import sys

ROOT = os.getcwd()

ALWAYS_SKIP_DIRS = {
    ".git", "node_modules", "dist", "build", "out", "coverage",
    ".next", ".nuxt", "venv", ".venv", "__pycache__", "target",
    "vendor", ".cache", ".claude",
}


def js_like_patterns():
    return [
        ("function", re.compile(r"^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(")),
        ("function", re.compile(r"^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>")),
        ("function", re.compile(r"^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b")),
        ("class", re.compile(r"^\s*(?:export\s+)?class\s+([A-Za-z_$][\w$]*)")),
    ]


LANG_PATTERNS = {
    ".js": js_like_patterns(),
    ".jsx": js_like_patterns(),
    ".ts": js_like_patterns(),
    ".tsx": js_like_patterns(),
    ".mjs": js_like_patterns(),
    ".cjs": js_like_patterns(),
    ".py": [
        ("function", re.compile(r"^\s*def\s+([A-Za-z_]\w*)\s*\(")),
        ("class", re.compile(r"^\s*class\s+([A-Za-z_]\w*)\s*[:(]")),
    ],
    ".go": [
        ("function", re.compile(r"^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\s*\(")),
    ],
    ".rb": [
        ("function", re.compile(r"^\s*def\s+([A-Za-z_][\w?!=]*)")),
        ("class", re.compile(r"^\s*class\s+([A-Za-z_]\w*)")),
    ],
    ".php": [
        ("function", re.compile(r"^\s*(?:public|private|protected|static)?\s*function\s+([A-Za-z_]\w*)\s*\(")),
        ("class", re.compile(r"^\s*class\s+([A-Za-z_]\w*)")),
    ],
    ".java": [
        ("method", re.compile(r"^\s*(?:public|private|protected|static|final|synchronized|\s)+[\w<>\[\],\s]+\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*\{")),
        ("class", re.compile(r"^\s*(?:public|private|protected)?\s*class\s+([A-Za-z_]\w*)")),
    ],
    ".cs": [
        ("method", re.compile(r"^\s*(?:public|private|protected|internal|static|async|\s)+[\w<>\[\],\s]+\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*\{")),
        ("class", re.compile(r"^\s*(?:public|private|protected|internal)?\s*class\s+([A-Za-z_]\w*)")),
    ],
}


def load_gitignore():
    gitignore_path = os.path.join(ROOT, ".gitignore")
    extra = set()
    if os.path.isfile(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8") as f:
            lines = f.read().splitlines()
        for line in lines:
            trimmed = line.strip()
            if not trimmed or trimmed.startswith("#"):
                continue
            bare = trimmed.lstrip("/").rstrip("/")
            if bare and "*" not in bare and "/" not in bare:
                extra.add(bare)
    return extra


def walk(directory, skip_dirs, out):
    try:
        entries = list(os.scandir(directory))
    except OSError:
        return
    for entry in entries:
        name = entry.name
        if name.startswith(".") and name != ".":
            if entry.is_dir() and name != ".claude":
                continue
            if not entry.is_dir():
                continue
        full = os.path.join(directory, name)
        if entry.is_dir():
            if name in ALWAYS_SKIP_DIRS or name in skip_dirs:
                continue
            walk(full, skip_dirs, out)
        elif entry.is_file():
            ext = os.path.splitext(name)[1]
            if ext in LANG_PATTERNS:
                out.append(full)


def scan_file(file_path):
    rel = os.path.relpath(file_path, ROOT).replace(os.sep, "/")
    ext = os.path.splitext(file_path)[1]
    patterns = LANG_PATTERNS[ext]
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        lines = f.read().splitlines()
    results = []
    for idx, line_text in enumerate(lines):
        for kind, pattern in patterns:
            m = pattern.match(line_text)
            if m:
                results.append({
                    "file": rel,
                    "line": idx + 1,
                    "name": m.group(1),
                    "kind": kind,
                    "signature": line_text.strip()[:200],
                })
                break
    return results


def main():
    skip_dirs = load_gitignore()
    files = []
    walk(ROOT, skip_dirs, files)
    results = []
    for file_path in files:
        results.extend(scan_file(file_path))
    sys.stdout.write(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
