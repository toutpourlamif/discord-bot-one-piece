import { pluralize } from '../../../shared/pluralize.js';
import type { WipeHistoryForPlayerResult, WipeHistoryMode } from '../../history/services/index.js';

export function buildWipeHistoryMessage(
  playerName: string,
  type: string | undefined,
  mode: WipeHistoryMode,
  { wipedHistoryCount, remainingPendingEventCount }: WipeHistoryForPlayerResult,
): string {
  const typeLabel = type ? ` \`${type}\`` : '';
  const lines = [`**${playerName}** — ${describeWipe(wipedHistoryCount, mode, typeLabel)}`];

  if (remainingPendingEventCount > 0) {
    lines.push(`⚠️ ${pluralize(remainingPendingEventCount, 'event_instance pending restant', 'event_instance pending restants')}.`);
  }

  return lines.join('\n');
}

function describeWipe(count: number, mode: WipeHistoryMode, typeLabel: string): string {
  if (count === 0) return `aucune entrée${typeLabel} à supprimer.`;
  if (mode === 'last') return `dernière entrée${typeLabel} supprimée.`;
  return `${pluralize(count, `entrée${typeLabel} supprimée`, `entrées${typeLabel} supprimées`)}.`;
}
