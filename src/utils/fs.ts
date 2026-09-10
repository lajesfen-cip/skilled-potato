import fs from "fs";
import { CLAUDE_DIR } from "../index.js";

function claudeDirExists(path: string): boolean {
  return fs.existsSync(path + "/" + CLAUDE_DIR);
}

export function getClaudeDir(path: string): string {
  if (!claudeDirExists(path)) {
    fs.mkdirSync(path + "/" + CLAUDE_DIR, { recursive: true });
  }
  return path + "/" + CLAUDE_DIR;
}
