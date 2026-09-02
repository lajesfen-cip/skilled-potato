"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { listSkills, DEFAULT_DESCRIPTION } = require("../lib/list");

test("listSkills returns name + description for each directory entry, skipping files", async () => {
  const fetchJSON = async (url) => {
    if (url.includes("api.github.com")) {
      return [
        { name: "check-existing-code", type: "dir" },
        { name: "README.md", type: "file" },
      ];
    }
    return { description: "Search before writing new code." };
  };

  const result = await listSkills({ fetchJSON });

  assert.deepEqual(result, [
    { name: "check-existing-code", description: "Search before writing new code." },
  ]);
});

test("listSkills falls back to a default description when skill.json is missing", async () => {
  const fetchJSON = async (url) => {
    if (url.includes("api.github.com")) {
      return [{ name: "mystery-skill", type: "dir" }];
    }
    throw new Error("not found");
  };

  const result = await listSkills({ fetchJSON });

  assert.deepEqual(result, [{ name: "mystery-skill", description: DEFAULT_DESCRIPTION }]);
});

test("listSkills returns an empty list when the catalog directory has no subfolders", async () => {
  const fetchJSON = async () => [{ name: "README.md", type: "file" }];

  const result = await listSkills({ fetchJSON });

  assert.deepEqual(result, []);
});
