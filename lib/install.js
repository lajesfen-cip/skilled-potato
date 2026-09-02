"use strict";

const fs = require("fs");
const path = require("path");
const { rawUrl } = require("./catalog");

const TARGET_DIR = ".claude/skills";

class UnknownSkillError extends Error {
  constructor(name) {
    super(`Could not find skill "${name}". Run "potato list" to see available skills.`);
    this.name = "UnknownSkillError";
  }
}

async function addSkill(name, { fetchJSON, fetchText, cwd = process.cwd() }) {
  if (!name) {
    throw new Error("skill name is required");
  }

  let manifest;
  try {
    manifest = await fetchJSON(rawUrl(name, "skill.json"));
  } catch {
    throw new UnknownSkillError(name);
  }

  const files = Array.isArray(manifest.files) ? manifest.files : [];
  const targetDir = path.join(cwd, TARGET_DIR, name);
  fs.mkdirSync(targetDir, { recursive: true });

  const written = [];
  for (const file of files) {
    const content = await fetchText(rawUrl(name, file));
    const targetPath = path.join(targetDir, file);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content);
    written.push(path.relative(cwd, targetPath));
  }

  return { name, targetDir: path.relative(cwd, targetDir), written };
}

module.exports = { addSkill, UnknownSkillError, TARGET_DIR };
