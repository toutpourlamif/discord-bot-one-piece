export type DevHistoryResetLog = {
  type: 'dev.history_reset';
  payload: { wipedCount: number };
};

export type DevLog = DevHistoryResetLog;
