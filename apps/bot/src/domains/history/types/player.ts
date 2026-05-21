import type { SubZone, Zone } from '@one-piece/db';

type PlayerZoneChangedLog = {
  type: 'player.zone_changed';
  payload: {
    from: Zone;
    to: Zone;
  };
};

type PlayerSubZoneChangedLog = {
  type: 'player.subZoneChanged';
  payload: {
    from: SubZone | null;
    to: SubZone;
  };
};

type PlayerRenamedLog = {
  type: 'player.renamed';
  payload: {
    from: string;
    to: string;
  };
};

export type PlayerLog = PlayerZoneChangedLog | PlayerSubZoneChangedLog | PlayerRenamedLog;
