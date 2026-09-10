import { accentBold, bold, dim } from "../utils/style.js";

export function help(): void {
  const cmd = (name: string, args = ""): string =>
    `${accentBold(name)}${args ? ` ${dim(args)}` : ""}`;

  console.log(`${bold("Usage:")} potato <command> [options]

${bold("Commands:")}
  ${cmd("add", "<skill>")}       Install a skill from the catalog into .claude/skills/
  ${cmd("remove", "<skill>")}    Remove an installed skill
  ${cmd("list")}              List all skills available in the catalog (use --local for installed)
  ${cmd("update", "<skill>")}    Update one installed skill to the latest version

${bold("Options:")}
  ${accentBold("-g, --global")}      Target ~/.claude/skills/ instead of the current project
      ${accentBold("--local")}       (list only) Show installed skills instead of the catalog
      ${accentBold("--all")}         (update only) Update every outdated installed skill
  ${accentBold("-y, --yes")}         Skip confirmation prompts
  ${accentBold("-h, --help")}        Show this help message`);
}
