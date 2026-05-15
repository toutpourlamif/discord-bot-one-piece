import type { Island, Sea } from '@one-piece/db';

type TravelPayloadBase = {
  from: Sea;
  actualDurationBuckets: number;
};

type TravelArrivedLog = {
  type: 'travel.arrived';
  payload: TravelPayloadBase & { to: Island };
};

type TravelDriftedLog = {
  type: 'travel.drifted';
  payload: TravelPayloadBase & { intendedTo: Island; actualTo: Island };
};

type TravelReroutedLog = {
  type: 'travel.rerouted';
  payload: { from: Island; originalTo: Island; newTo: Island };
};

export type NavigationLog = TravelArrivedLog | TravelDriftedLog | TravelReroutedLog;
