"use strict";

const { contentsApiUrl, rawUrl } = require("./catalog");

const DEFAULT_DESCRIPTION = "(no skill.json found)";

async function listSkills({ fetchJSON }) {
  const entries = await fetchJSON(contentsApiUrl());
  const dirs = entries.filter((e) => e.type === "dir");

  const results = [];
  for (const dir of dirs) {
    let description = DEFAULT_DESCRIPTION;
    try {
      const manifest = await fetchJSON(rawUrl(dir.name, "skill.json"));
      if (manifest.description) description = manifest.description;
    } catch {
      // no skill.json, or it failed to parse — keep the default description
    }
    results.push({ name: dir.name, description });
  }
  return results;
}

module.exports = { listSkills, DEFAULT_DESCRIPTION };
