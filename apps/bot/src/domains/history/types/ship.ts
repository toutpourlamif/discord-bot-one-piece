export type ShipRenamedLog = {
  type: 'ship.renamed';
  payload: {
    oldName: string;
    newName: string;
  };
};

export type ShipLog = ShipRenamedLog;
