import path from "node:path";
import { confirm } from "../utils/prompt.js";
import {
  downloadSkillFiles,
  getLocalSkillsStatus,
  getSkillMetadata,
  type LocalSkillStatus,
  resolveSkillsDir,
} from "../utils/skills.js";
import { accent, dim, success } from "../utils/style.js";

export type UpdateOptions = {
  global?: boolean;
  all?: boolean;
  yes?: boolean;
};

export async function update(
  skill: string,
  options: UpdateOptions = {},
): Promise<void> {
  const dir = resolveSkillsDir(options.global);
  const statuses = await getLocalSkillsStatus(dir);

  let targets: LocalSkillStatus[];

  if (options.all) {
    targets = statuses.filter((status) => status.isOutdated);
    if (targets.length === 0) {
      console.log(dim("All skills are up to date."));
      return;
    }
  } else {
    if (!skill) {
      throw new Error(
        "Usage: potato update <skill> [--global] | potato update --all [--global]",
      );
    }

    const found = statuses.find((status) => status.name === skill);
    if (!found) {
      throw new Error(
        `Skill "${skill}" is not installed (${options.global ? "global" : "local"}).`,
      );
    }
    if (found.isExternal) {
      throw new Error(
        `Skill "${skill}" is external and can't be updated from the catalog.`,
      );
    }
    if (!found.isOutdated) {
      console.log(dim(`"${accent(skill)}" is already up to date.`));
      return;
    }
    targets = [found];
  }

  for (const target of targets) {
    if (!options.yes) {
      const confirmed = await confirm(
        `Update "${accent(target.name)}" ${target.localVersion} -> ${target.remoteVersion}?`,
      );
      if (!confirmed) {
        continue;
      }
    }

    const metadata = await getSkillMetadata(target.name);
    const destDir = path.join(dir, target.name);
    await downloadSkillFiles(target.name, metadata, destDir);
    console.log(
      success(`Updated ${accent(target.name)} -> ${metadata._version}`),
    );
  }
}
