export function pluralize(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
