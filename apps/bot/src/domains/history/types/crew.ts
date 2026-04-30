export type CaptainChangedLog = {
  type: 'crew.captain_changed';
  payload: {
    fromCharacterInstanceId: number | null;
    toCharacterInstanceId: number;
  };
};

export type CrewLog = CaptainChangedLog;
