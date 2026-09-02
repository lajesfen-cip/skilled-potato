"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { rawUrl, contentsApiUrl, OWNER, REPO, BRANCH, CATALOG_DIR } = require("../lib/catalog");

test("rawUrl builds a raw.githubusercontent.com URL for a skill file", () => {
  assert.equal(
    rawUrl("check-existing-code", "SKILL.md"),
    `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${CATALOG_DIR}/check-existing-code/SKILL.md`
  );
});

test("contentsApiUrl points at the catalog directory on the configured branch", () => {
  assert.equal(
    contentsApiUrl(),
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CATALOG_DIR}?ref=${BRANCH}`
  );
});
