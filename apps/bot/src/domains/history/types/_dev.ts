export type DevHistoryResetLog = {
  type: 'dev.historyReset';
  payload: {
    wipedCount: number;
    remainingPendingEventCount?: number;
    kind?: string;
    mode?: 'last' | 'all';
  };
};

export type DevLog = DevHistoryResetLog;
