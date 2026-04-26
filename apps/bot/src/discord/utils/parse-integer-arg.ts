export function parseIntegerArg(raw: string | undefined): number {
  const value = Number(raw);

  if (!Number.isInteger(value)) {
    throw new Error(`Argument entier invalide: "${raw}"`);
  }

  return value;
}
