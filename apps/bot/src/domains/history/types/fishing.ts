export type FishingAttemptNothingLog = {
  type: 'fishing.attempt.nothing';
  payload: Record<string, never>;
};

export type FishingAttemptResourceLog = {
  type: 'fishing.attempt.resource';
  payload: {
    resourceName: string;
    quantity: number;
  };
};

export type FishingAttemptBerryLog = {
  type: 'fishing.attempt.berry';
  payload: {
    amount: number;
  };
};

export type FishingLog = FishingAttemptNothingLog | FishingAttemptResourceLog | FishingAttemptBerryLog;
