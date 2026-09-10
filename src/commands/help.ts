export function help(): void {
  console.log(`Usage: potato <command> [options]

Commands:
  add <skill>       Install a skill from the catalog into .claude/skills/
  remove <skill>    Remove an installed skill
  list              List all skills available in the catalog
  update <skill>    Update one installed skill to the latest version

Options:
  -g, --global      Target ~/.claude/skills/ instead of the current project
      --local       (list only) Show installed skills instead of the catalog
      --all         (update only) Update every outdated installed skill
  -y, --yes         Skip confirmation prompts
  -h, --help        Show this help message`);
}
