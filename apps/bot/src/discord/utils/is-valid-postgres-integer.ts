const PG_INT_MIN = -2147483648;
const PG_INT_MAX = 2147483647;

export function isValidPostgresInteger(value: number): boolean {
  return Number.isInteger(value) && value >= PG_INT_MIN && value <= PG_INT_MAX;
}
