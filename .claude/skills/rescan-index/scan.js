#!/usr/bin/env node
// Deterministic function/class scanner for the rescan-index skill.
// Walks the repo, regex-matches function/class declarations per file extension,
// and prints a JSON array of {file, line, name, kind, signature} to stdout.
// Descriptions and "reusable" flags are NOT produced here — that's left to the
// skill's LLM step, since it requires reading and understanding the code.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const ALWAYS_SKIP_DIRS = new Set([
  ".git", "node_modules", "dist", "build", "out", "coverage",
  ".next", ".nuxt", "venv", ".venv", "__pycache__", "target",
  "vendor", ".cache", ".claude",
]);

const LANG_PATTERNS = {
  ".js": jsLikePatterns(),
  ".jsx": jsLikePatterns(),
  ".ts": jsLikePatterns(),
  ".tsx": jsLikePatterns(),
  ".mjs": jsLikePatterns(),
  ".cjs": jsLikePatterns(),
  ".py": [
    { kind: "function", re: /^\s*def\s+([A-Za-z_]\w*)\s*\(/ },
    { kind: "class", re: /^\s*class\s+([A-Za-z_]\w*)\s*[:(]/ },
  ],
  ".go": [
    { kind: "function", re: /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\s*\(/ },
  ],
  ".rb": [
    { kind: "function", re: /^\s*def\s+([A-Za-z_][\w?!=]*)/ },
    { kind: "class", re: /^\s*class\s+([A-Za-z_]\w*)/ },
  ],
  ".php": [
    { kind: "function", re: /^\s*(?:public|private|protected|static)?\s*function\s+([A-Za-z_]\w*)\s*\(/ },
    { kind: "class", re: /^\s*class\s+([A-Za-z_]\w*)/ },
  ],
  ".java": [
    { kind: "method", re: /^\s*(?:public|private|protected|static|final|synchronized|\s)+[\w<>\[\],\s]+\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*\{/ },
    { kind: "class", re: /^\s*(?:public|private|protected)?\s*class\s+([A-Za-z_]\w*)/ },
  ],
  ".cs": [
    { kind: "method", re: /^\s*(?:public|private|protected|internal|static|async|\s)+[\w<>\[\],\s]+\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*\{/ },
    { kind: "class", re: /^\s*(?:public|private|protected|internal)?\s*class\s+([A-Za-z_]\w*)/ },
  ],
};

function jsLikePatterns() {
  return [
    { kind: "function", re: /^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/ },
    { kind: "function", re: /^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/ },
    { kind: "function", re: /^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b/ },
    { kind: "class", re: /^\s*(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/ },
  ];
}

function loadGitignore() {
  const gitignorePath = path.join(ROOT, ".gitignore");
  const extra = new Set();
  if (fs.existsSync(gitignorePath)) {
    const lines = fs.readFileSync(gitignorePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const bare = trimmed.replace(/^\/+/, "").replace(/\/+$/, "");
      if (bare && !bare.includes("*") && !bare.includes("/")) {
        extra.add(bare);
      }
    }
  }
  return extra;
}

function walk(dir, skipDirs, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".") {
      if (entry.isDirectory() && entry.name !== ".claude") continue;
      if (!entry.isDirectory()) continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ALWAYS_SKIP_DIRS.has(entry.name) || skipDirs.has(entry.name)) continue;
      walk(full, skipDirs, out);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (LANG_PATTERNS[ext]) out.push(full);
    }
  }
}

function scanFile(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const ext = path.extname(file);
  const patterns = LANG_PATTERNS[ext];
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const results = [];
  lines.forEach((lineText, idx) => {
    for (const { kind, re } of patterns) {
      const m = lineText.match(re);
      if (m) {
        results.push({
          file: rel,
          line: idx + 1,
          name: m[1],
          kind,
          signature: lineText.trim().slice(0, 200),
        });
        break;
      }
    }
  });
  return results;
}

function main() {
  const skipDirs = loadGitignore();
  const files = [];
  walk(ROOT, skipDirs, files);
  const results = [];
  for (const file of files) {
    results.push(...scanFile(file));
  }
  process.stdout.write(JSON.stringify(results, null, 2));
}

main();
