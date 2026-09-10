#!/usr/bin/env node
import { parseArgs } from "node:util";

export const CLAUDE_DIR = ".claude/skills/";

function main(): void {
  const { values, positionals } = parseArgs({
    options: {
      help: { type: "boolean", short: "h" },
      json: { type: "boolean" },
      output: { type: "string", short: "o" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log("Usage: mycli [options] <input>");
  }
}

main();
