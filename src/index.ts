#!/usr/bin/env node
import { parseArgs } from "node:util";
import { add } from "./commands/add.js";
import { help } from "./commands/help.js";
import { list } from "./commands/list.js";
import { remove } from "./commands/remove.js";
import { update } from "./commands/update.js";
import { error } from "./utils/style.js";

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  switch (command) {
    case "add": {
      const { positionals, values } = parseArgs({
        args: rest,
        allowPositionals: true,
        options: {
          global: { type: "boolean", short: "g" },
          yes: { type: "boolean", short: "y" },
        },
      });
      await add(positionals[0], { global: values.global, yes: values.yes });
      break;
    }
    case "remove": {
      const { positionals, values } = parseArgs({
        args: rest,
        allowPositionals: true,
        options: {
          global: { type: "boolean", short: "g" },
          yes: { type: "boolean", short: "y" },
        },
      });
      await remove(positionals[0], { global: values.global, yes: values.yes });
      break;
    }
    case "list": {
      const { values } = parseArgs({
        args: rest,
        options: {
          local: { type: "boolean" },
          global: { type: "boolean", short: "g" },
        },
      });
      await list({ local: values.local, global: values.global });
      break;
    }
    case "update": {
      const { positionals, values } = parseArgs({
        args: rest,
        allowPositionals: true,
        options: {
          global: { type: "boolean", short: "g" },
          all: { type: "boolean" },
          yes: { type: "boolean", short: "y" },
        },
      });
      await update(positionals[0], {
        global: values.global,
        all: values.all,
        yes: values.yes,
      });
      break;
    }
    case undefined:
    case "help":
    case "-h":
    case "--help":
      help();
      break;
    default:
      console.error(error(`Unknown command: ${command}`));
      help();
      process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(
    error(`Error: ${err instanceof Error ? err.message : String(err)}`),
  );
  process.exitCode = 1;
});
