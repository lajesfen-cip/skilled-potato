#!/usr/bin/env node
"use strict";

const { fetchJSON, fetchText } = require("../lib/github");
const { listSkills } = require("../lib/list");
const { addSkill } = require("../lib/install");

async function runList() {
  const skills = await listSkills({ fetchJSON });
  for (const s of skills) console.log(`${s.name} — ${s.description}`);
  return skills;
}

async function runAdd(name) {
  const result = await addSkill(name, { fetchJSON, fetchText });
  for (const f of result.written) console.log(`  wrote ${f}`);
  console.log(`Added "${result.name}" to ${result.targetDir}`);
}

async function runInteractive() {
  const skills = await listSkills({ fetchJSON });
  if (skills.length === 0) {
    console.log("No skills available.");
    return;
  }

  const prompts = require("prompts");
  const response = await prompts({
    type: "select",
    name: "skill",
    message: "Pick a skill to add to this project",
    choices: skills.map((s) => ({ title: s.name, description: s.description, value: s.name })),
  });

  if (!response.skill) {
    console.log("Cancelled.");
    return;
  }
  await runAdd(response.skill);
}

async function main() {
  const [command, arg] = process.argv.slice(2);
  try {
    if (!command) {
      await runInteractive();
    } else if (command === "list") {
      await runList();
    } else if (command === "add") {
      if (!arg) {
        console.error("Usage: potato add <skill-name>");
        process.exitCode = 1;
        return;
      }
      await runAdd(arg);
    } else {
      console.log("Usage:\n  potato                  interactive picker\n  potato list\n  potato add <skill-name>");
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}

main();
