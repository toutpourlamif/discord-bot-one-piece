import { buildCustomId } from '../../../discord/utils/index.js';
import { EVENT_BUTTON_NAME, EVENT_CONSEQUENCE_BUTTON_NAME, EVENT_NEXT_BUTTON_NAME } from '../constants.js';

/** @return evt:230212 */
export function buildEventPassiveNextCustomId(eventInstanceId: bigint): string {
  return buildCustomId(EVENT_BUTTON_NAME, eventInstanceId.toString());
}

/** @return evt:230213:attackCrocodile */
export function buildEventInteractiveChoiceCustomId(eventInstanceId: bigint, choiceId: string): string {
  return buildCustomId(EVENT_BUTTON_NAME, eventInstanceId.toString(), choiceId);
}

/** @return evt-next:123456789 */
export function buildEventNextCustomId(ownerDiscordId: string): string {
  return buildCustomId(EVENT_NEXT_BUTTON_NAME, ownerDiscordId);
}

/** @return evt-conseq:123456789 */
export function buildEventConsequenceCustomId(ownerDiscordId: string): string {
  return buildCustomId(EVENT_CONSEQUENCE_BUTTON_NAME, ownerDiscordId);
}
