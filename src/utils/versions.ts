function parseSkillVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

export function isSkillOutdated(
  localVersion: string,
  remoteVersion: string,
): boolean {
  const local = parseSkillVersion(localVersion);
  const remote = parseSkillVersion(remoteVersion);
  if (local.major < remote.major) {
    return true;
  }
  if (local.major === remote.major && local.minor < remote.minor) {
    return true;
  }
  if (
    local.major === remote.major &&
    local.minor === remote.minor &&
    local.patch < remote.patch
  ) {
    return true;
  }
  return false;
}
