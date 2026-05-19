export type DevHistoryResetLog = {
  type: 'dev.historyReset';
  payload: { wipedCount: number };
};

export type DevLog = DevHistoryResetLog;
