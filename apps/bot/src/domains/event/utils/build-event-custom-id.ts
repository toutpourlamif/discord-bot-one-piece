import { buildCustomId } from '../../../discord/utils/index.js';
import { EVENT_BUTTON_NAME } from '../constants.js';

/** @return evt:230212 */
export function buildEventPassiveNextCustomId(eventInstanceId: bigint): string {
  return buildCustomId(EVENT_BUTTON_NAME, eventInstanceId.toString());
}

/** @return evt:230213:attackCrocodile */
export function buildEventInteractiveChoiceCustomId(eventInstanceId: bigint, choiceId: string): string {
  return buildCustomId(EVENT_BUTTON_NAME, eventInstanceId.toString(), choiceId);
}
