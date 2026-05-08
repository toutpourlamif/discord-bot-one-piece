import type { Zone } from '@one-piece/db';

type PlayerZoneChangedLog = {
  type: 'player.zone_changed';
  payload: {
    from: Zone;
    to: Zone;
  };
};

export type PlayerLog = PlayerZoneChangedLog;
