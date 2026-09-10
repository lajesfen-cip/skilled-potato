import fs from "node:fs";
import path from "node:path";
import { confirm } from "../utils/prompt.js";
import {
  downloadSkillFiles,
  getSkillMetadata,
  getSkillsList,
  resolveSkillsDir,
} from "../utils/skills.js";
import { accent, dim, success } from "../utils/style.js";

export type AddOptions = {
  global?: boolean;
  yes?: boolean;
};

export async function add(
  skill: string,
  options: AddOptions = {},
): Promise<void> {
  if (!skill) {
    throw new Error("Usage: potato add <skill> [--global] [--yes]");
  }

  const remoteSkills = await getSkillsList();
  if (!remoteSkills.includes(skill)) {
    throw new Error(
      `Skill "${skill}" was not found in the catalog. Run "potato list" to see available skills.`,
    );
  }

  const dir = resolveSkillsDir(options.global);
  const destDir = path.join(dir, skill);

  if (fs.existsSync(destDir) && !options.yes) {
    const overwrite = await confirm(
      `Skill "${accent(skill)}" is already installed. Overwrite?`,
    );
    if (!overwrite) {
      console.log(dim("Aborted."));
      return;
    }
  }

  const metadata = await getSkillMetadata(skill);
  await downloadSkillFiles(skill, metadata, destDir);

  console.log(
    success(
      `Installed ${accent(skill)}@${metadata._version} (${options.global ? "global" : "local"})`,
    ),
  );
}
