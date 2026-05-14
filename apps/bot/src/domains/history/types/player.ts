import type { Zone } from '@one-piece/db';

type PlayerZoneChangedLog = {
  type: 'player.zone_changed';
  payload: {
    from: Zone;
    to: Zone;
  };
};

type PlayerRenamedLog = {
  type: 'player.renamed';
  payload: {
    from: string;
    to: string;
  };
};

export type PlayerLog = PlayerZoneChangedLog | PlayerRenamedLog;
