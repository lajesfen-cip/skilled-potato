import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.join(__dirname, "..", "skills");
const manifestPath = path.join(skillsDir, "manifest.json");

const skillNames = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const manifest = skillNames.map((name) => {
  const raw = fs.readFileSync(
    path.join(skillsDir, name, "skill.json"),
    "utf-8",
  );
  return JSON.parse(raw);
});

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Wrote ${manifest.length} skill(s) to ${path.relative(process.cwd(), manifestPath)}`,
);
