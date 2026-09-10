import {
  getLocalSkillsStatus,
  getSkillMetadata,
  getSkillsList,
  type LocalSkillStatus,
  resolveSkillsDir,
} from "../utils/skills.js";
import { accent, bold, dim, warn } from "../utils/style.js";

export type ListOptions = {
  local?: boolean;
  global?: boolean;
};

function formatLocalStatus(status: LocalSkillStatus): string {
  if (status.isExternal) {
    return dim(`${status.name} (external)`);
  }
  if (status.isOutdated) {
    return `${accent(status.name)} ${warn(`(outdated: ${status.localVersion} -> ${status.remoteVersion})`)}`;
  }
  return accent(status.name);
}

export async function list(options: ListOptions = {}): Promise<void> {
  if (options.local && options.global) {
    throw new Error("Use either --local or --global, not both.");
  }

  if (options.local || options.global) {
    const dir = resolveSkillsDir(options.global);
    const statuses = await getLocalSkillsStatus(dir);

    console.log(
      bold(`Installed (${options.global ? "global" : "local"}):`),
    );

    if (statuses.length === 0) {
      console.log(dim("No skills installed."));
      return;
    }

    for (const status of statuses) {
      console.log(`${dim("•")} ${formatLocalStatus(status)}`);
    }
    return;
  }

  const remoteSkills = await getSkillsList();
  const lines = await Promise.all(
    remoteSkills.map(async (name) => {
      const metadata = await getSkillMetadata(name).catch(() => null);
      return metadata
        ? `${accent(name)} ${dim("-")} ${metadata.description}`
        : accent(name);
    }),
  );

  console.log(bold("Catalog:"));
  for (const line of lines) {
    console.log(`${dim("•")} ${line}`);
  }
}
