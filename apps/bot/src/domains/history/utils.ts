export function parseHistoryTargetId(targetId: number | string | null | undefined): number | null {
  if (targetId == null) {
    return null;
  }

  const parsed = Number(targetId);

  if (!Number.isInteger(parsed)) {
    throw new TypeError('history targetId must be an integer');
  }

  return parsed;
}
