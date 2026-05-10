import type { Island, Sea } from '@one-piece/db';

type TravelArrivedLog = {
  type: 'travel.arrived';
  payload: {
    from: Sea;
    to: Island;
    actualDurationBuckets: number;
  };
};

type TravelDriftedLog = {
  type: 'travel.drifted';
  payload: {
    from: Sea;
    intendedTo: Island;
    actualTo: Island;
  };
};

export type NavigationLog = TravelArrivedLog | TravelDriftedLog;
