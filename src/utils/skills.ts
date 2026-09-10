import fs from "fs";
import path from "path";
import { getClaudeDir } from "./fs";
import { isSkillOutdated } from "./versions";

type SkillMetadata = {
  name: string;
  _version: string;
  description: string;
  files: string[];
};

export function getSkillsList(): Promise<string[]> {
  return fetch(
    `https://api.github.com/repos/lajesfen-cip/skilled-potato/contents/skills?ref=main`,
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch skills list");
      }
      return response.json() as Promise<{ name: string }[]>;
    })
    .then((data) => {
      return data.map((item) => item.name);
    });
}

export async function getSkillMetadata(skill: string): Promise<SkillMetadata> {
  const url = `https://raw.githubusercontent.com/lajesfen-cip/skilled-potato/main/skills/${skill}/skill.json`;
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch skill metadata for ${skill}`);
    }
    return response.json() as Promise<SkillMetadata>;
  });
}

function getLocalSkillMetadata(
  dir: string,
  skill: string,
): SkillMetadata | null {
  try {
    const raw = fs.readFileSync(path.join(dir, skill, "skill.json"), "utf-8");
    return JSON.parse(raw) as SkillMetadata;
  } catch {
    return null;
  }
}

export async function getLocalSkills(): Promise<string[]> {
  const remoteSkills = await getSkillsList();
  const dir = getClaudeDir(process.cwd());

  const localSkillNames = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return Promise.all(
    localSkillNames.map(async (name) => {
      if (!remoteSkills.includes(name)) {
        return `${name} (external)`;
      }

      const localMetadata = getLocalSkillMetadata(dir, name);
      const remoteMetadata = await getSkillMetadata(name).catch(() => null);
      const isOutdated =
        localMetadata !== null &&
        remoteMetadata !== null &&
        isSkillOutdated(localMetadata._version, remoteMetadata._version);

      return `${name}${isOutdated ? ` [${localMetadata._version} -> ${remoteMetadata._version}]` : ""}`;
    }),
  );
}
