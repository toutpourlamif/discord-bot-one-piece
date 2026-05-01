export type CaptainChangedLog = {
  type: 'crew.captain_changed';
  payload: {
    fromCharacterInstanceId: number;
    toCharacterInstanceId: number;
  };
};

export type CrewLog = CaptainChangedLog;
