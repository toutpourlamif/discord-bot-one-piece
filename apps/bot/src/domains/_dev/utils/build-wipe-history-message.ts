import type { WipeHistoryMode } from '../../history/index.js';

type WipeHistoryResult = {
  wipedHistoryCount: number;
  remainingPendingEventCount: number;
};

export function buildWipeHistoryMessage(
  playerName: string,
  kind: string | undefined,
  mode: WipeHistoryMode,
  result: WipeHistoryResult,
): string {
  const scope = kind ? `pour \`${kind}\`` : 'sur tout son historique';
  const historyMessage = `History de ${playerName} wipée: ${result.wipedHistoryCount} ligne(s) supprimée(s) dans \`history\` ${scope} en mode \`${mode}\`.`;
  if (result.remainingPendingEventCount === 0) return historyMessage;

  const pendingScope = kind ? 'pour ce type' : 'pour ce joueur';
  return `${historyMessage} Il reste ${result.remainingPendingEventCount} event_instance pending ${pendingScope}.`;
}
