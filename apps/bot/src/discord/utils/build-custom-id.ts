import { CUSTOM_ID_SEPARATOR, DISCORD_CUSTOM_ID_MAX_LENGTH } from '../constants.js';

export function buildCustomId(name: string, ...args: Array<string | number>): string {
  assertNoSeparatorInSegments([name, ...args]);
  const customId = [name, ...args].join(CUSTOM_ID_SEPARATOR);
  assertCustomIdWithinMaxLength(customId);
  return customId;
}

function assertNoSeparatorInSegments(segments: Array<string | number>) {
  for (const segment of segments) {
    if (String(segment).includes(CUSTOM_ID_SEPARATOR)) {
      throw new Error(`customId segment contient le séparateur "${CUSTOM_ID_SEPARATOR}": ${segment}`);
    }
  }
}

function assertCustomIdWithinMaxLength(customId: string) {
  if (customId.length > DISCORD_CUSTOM_ID_MAX_LENGTH) {
    throw new Error(`customId trop long: ${customId}`);
  }
}
