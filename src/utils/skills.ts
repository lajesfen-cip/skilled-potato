import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isSkillOutdated } from "./versions";

const REPO = "lajesfen-cip/skilled-potato";
const RAW_BASE_URL = `https://raw.githubusercontent.com/${REPO}/main`;
const CLAUDE_DIR = ".claude/skills";

export type SkillMetadata = {
  name: string;
  _version: string;
  description: string;
  files: string[];
};

export type LocalSkillStatus = {
  name: string;
  description: string | null;
  isExternal: boolean;
  localVersion: string | null;
  remoteVersion: string | null;
  isOutdated: boolean;
};

let catalogPromise: Promise<SkillMetadata[]> | null = null;

function getCatalog(): Promise<SkillMetadata[]> {
  if (!catalogPromise) {
    catalogPromise = fetch(`${RAW_BASE_URL}/skills/manifest.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch skill catalog");
        }
        return response.json() as Promise<SkillMetadata[]>;
      })
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }
  return catalogPromise;
}

export async function getSkillsList(): Promise<string[]> {
  const catalog = await getCatalog();
  return catalog.map((skill) => skill.name);
}

export async function getSkillMetadata(skill: string): Promise<SkillMetadata> {
  const catalog = await getCatalog();
  const metadata = catalog.find((entry) => entry.name === skill);
  if (!metadata) {
    throw new Error(`Skill "${skill}" was not found in the catalog.`);
  }
  return metadata;
}

export function resolveSkillsDir(global: boolean = false): string {
  const baseDir = global ? os.homedir() : process.cwd();
  const dir = path.join(baseDir, CLAUDE_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getLocalSkillMetadata(
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

export async function downloadSkillFiles(
  skill: string,
  metadata: SkillMetadata,
  destDir: string,
): Promise<void> {
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(
    path.join(destDir, "skill.json"),
    `${JSON.stringify(metadata, null, 2)}\n`,
  );

  await Promise.all(
    metadata.files.map(async (file) => {
      const url = `${RAW_BASE_URL}/skills/${skill}/${file}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download "${file}" for skill "${skill}"`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const dest = path.join(destDir, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buffer);
    }),
  );
}

export async function getLocalSkillsStatus(
  dir: string,
): Promise<LocalSkillStatus[]> {
  const remoteSkills = await getSkillsList();

  if (!fs.existsSync(dir)) {
    return [];
  }

  const localSkillNames = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return Promise.all(
    localSkillNames.map(async (name) => {
      const localMetadata = getLocalSkillMetadata(dir, name);
      const isExternal = !remoteSkills.includes(name);

      if (isExternal) {
        return {
          name,
          description: localMetadata?.description ?? null,
          isExternal: true,
          localVersion: localMetadata?._version ?? null,
          remoteVersion: null,
          isOutdated: false,
        };
      }

      const remoteMetadata = await getSkillMetadata(name).catch(() => null);
      const isOutdated =
        localMetadata !== null &&
        remoteMetadata !== null &&
        isSkillOutdated(localMetadata._version, remoteMetadata._version);

      return {
        name,
        description: localMetadata?.description ?? null,
        isExternal: false,
        localVersion: localMetadata?._version ?? null,
        remoteVersion: remoteMetadata?._version ?? null,
        isOutdated,
      };
    }),
  );
}
