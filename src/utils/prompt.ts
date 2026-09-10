import prompts from "prompts";

export async function confirm(message: string): Promise<boolean> {
  const response = await prompts({
    type: "confirm",
    name: "value",
    message,
    initial: false,
  });
  return Boolean(response.value);
}
