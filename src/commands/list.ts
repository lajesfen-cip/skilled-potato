import {
  getLocalSkillsStatus,
  getSkillMetadata,
  getSkillsList,
  type LocalSkillStatus,
  resolveSkillsDir,
} from "../utils/skills";

export type ListOptions = {
  local?: boolean;
  global?: boolean;
};

function formatLocalStatus(status: LocalSkillStatus): string {
  if (status.isExternal) {
    return `${status.name} (external)`;
  }
  if (status.isOutdated) {
    return `${status.name} (outdated: ${status.localVersion} -> ${status.remoteVersion})`;
  }
  return status.name;
}

export async function list(options: ListOptions = {}): Promise<void> {
  if (options.local && options.global) {
    throw new Error("Use either --local or --global, not both.");
  }

  if (options.local || options.global) {
    const dir = resolveSkillsDir(options.global);
    const statuses = await getLocalSkillsStatus(dir);

    if (statuses.length === 0) {
      console.log("No skills installed.");
      return;
    }

    for (const status of statuses) {
      console.log(formatLocalStatus(status));
    }
    return;
  }

  const remoteSkills = await getSkillsList();
  const lines = await Promise.all(
    remoteSkills.map(async (name) => {
      const metadata = await getSkillMetadata(name).catch(() => null);
      return metadata ? `${name} - ${metadata.description}` : name;
    }),
  );

  for (const line of lines) {
    console.log(line);
  }
}
