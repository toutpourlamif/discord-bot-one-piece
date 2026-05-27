import { pluralize } from '../../../shared/pluralize.js';
import type { WipeHistoryForPlayerResult, WipeHistoryMode } from '../../history/services/index.js';

export function buildWipeHistoryMessage(
  playerName: string,
  kind: string | undefined,
  mode: WipeHistoryMode,
  { wipedHistoryCount, remainingPendingEventCount }: WipeHistoryForPlayerResult,
): string {
  const kindLabel = kind ? ` \`${kind}\`` : '';
  const lines = [`**${playerName}** — ${describeWipe(wipedHistoryCount, mode, kindLabel)}`];

  if (remainingPendingEventCount > 0) {
    lines.push(`⚠️ ${pluralize(remainingPendingEventCount, 'event_instance pending restant', 'event_instance pending restants')}.`);
  }

  return lines.join('\n');
}

function describeWipe(count: number, mode: WipeHistoryMode, kindLabel: string): string {
  if (count === 0) return `aucune entrée${kindLabel} à supprimer.`;
  if (mode === 'last') return `dernière entrée${kindLabel} supprimée.`;
  return `${pluralize(count, `entrée${kindLabel} supprimée`, `entrées${kindLabel} supprimées`)}.`;
}
