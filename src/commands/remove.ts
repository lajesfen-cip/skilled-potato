import fs from "node:fs";
import path from "node:path";
import { confirm } from "../utils/prompt";
import { resolveSkillsDir } from "../utils/skills";

export type RemoveOptions = {
  global?: boolean;
  yes?: boolean;
};

export async function remove(
  skill: string,
  options: RemoveOptions = {},
): Promise<void> {
  if (!skill) {
    throw new Error("Usage: potato remove <skill> [--global] [--yes]");
  }

  const dir = resolveSkillsDir(options.global);
  const destDir = path.join(dir, skill);
  const location = options.global ? "global" : "local";

  if (!fs.existsSync(destDir)) {
    throw new Error(`Skill "${skill}" is not installed (${location}).`);
  }

  if (!options.yes) {
    const confirmed = await confirm(`Remove "${skill}" (${location})?`);
    if (!confirmed) {
      console.log("Aborted.");
      return;
    }
  }

  fs.rmSync(destDir, { recursive: true, force: true });
  console.log(`Removed ${skill} (${location})`);
}
