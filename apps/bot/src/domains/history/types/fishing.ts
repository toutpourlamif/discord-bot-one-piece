export type FishingAttemptLog = {
  type: 'fishing.attempt';
  payload: {
    quantity: number;
    resourceName: string;
  };
};

export type FishingLog = FishingAttemptLog;
