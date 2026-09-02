"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { addSkill, UnknownSkillError } = require("../lib/install");

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "potato-test-"));
}

test("addSkill writes each manifest file under .claude/skills/<name>", async () => {
  const cwd = tempDir();
  const fetchJSON = async () => ({ name: "sample", description: "x", files: ["SKILL.md", "helper.py"] });
  const contents = { "SKILL.md": "# Sample\n", "helper.py": "print('hi')\n" };
  const fetchText = async (url) => contents[url.split("/").pop()];

  const result = await addSkill("sample", { fetchJSON, fetchText, cwd });

  assert.equal(result.name, "sample");
  assert.equal(fs.readFileSync(path.join(cwd, ".claude/skills/sample/SKILL.md"), "utf8"), "# Sample\n");
  assert.equal(fs.readFileSync(path.join(cwd, ".claude/skills/sample/helper.py"), "utf8"), "print('hi')\n");
  assert.deepEqual(
    result.written.sort(),
    [".claude/skills/sample/SKILL.md", ".claude/skills/sample/helper.py"].sort()
  );
});

test("addSkill throws UnknownSkillError when the manifest can't be fetched", async () => {
  const cwd = tempDir();
  const fetchJSON = async () => {
    throw new Error("404");
  };
  const fetchText = async () => {
    throw new Error("should not be called");
  };

  await assert.rejects(() => addSkill("does-not-exist", { fetchJSON, fetchText, cwd }), UnknownSkillError);
});

test("addSkill rejects when no name is given", async () => {
  const cwd = tempDir();

  await assert.rejects(() =>
    addSkill(undefined, { fetchJSON: async () => ({}), fetchText: async () => "", cwd })
  );
});

test("addSkill overwrites files already present from a previous install", async () => {
  const cwd = tempDir();
  fs.mkdirSync(path.join(cwd, ".claude/skills/sample"), { recursive: true });
  fs.writeFileSync(path.join(cwd, ".claude/skills/sample/SKILL.md"), "stale content");

  const fetchJSON = async () => ({ files: ["SKILL.md"] });
  const fetchText = async () => "fresh content";

  await addSkill("sample", { fetchJSON, fetchText, cwd });

  assert.equal(fs.readFileSync(path.join(cwd, ".claude/skills/sample/SKILL.md"), "utf8"), "fresh content");
});
