import chalk from "chalk";

/** Brand accent color used to highlight skill/command names. */
const ACCENT_HEX = "#FF8C00";

export const bold = chalk.bold;
export const underline = chalk.underline;
export const dim = chalk.dim;

export const accent = chalk.hex(ACCENT_HEX);
export const accentBold = chalk.hex(ACCENT_HEX).bold;

export const success = chalk.green;
export const warn = chalk.yellow;
export const error = chalk.red;
