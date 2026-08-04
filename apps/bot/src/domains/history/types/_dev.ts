export type DevWipeHistoryLog = {
  type: 'dev.historyReset';
  payload: {
    wipedCount: number;
    remainingPendingEventCount?: number;
    wipedType?: string;
    mode?: 'last' | 'all';
  };
};

export type DevLog = DevWipeHistoryLog;
