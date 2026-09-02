"use strict";

const OWNER = "lajesfen-cip";
const REPO = "skilled-potato";
const BRANCH = "main";
const CATALOG_DIR = "skills";

function rawUrl(skillName, file) {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${CATALOG_DIR}/${skillName}/${file}`;
}

function contentsApiUrl() {
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CATALOG_DIR}?ref=${BRANCH}`;
}

module.exports = { OWNER, REPO, BRANCH, CATALOG_DIR, rawUrl, contentsApiUrl };
