export type ShipRenamedLog = {
  type: 'ship.renamed';
  payload: {
    oldName: string;
    newName: string;
  };
};

export type ShipTemplateSwitchedLog = {
  type: 'ship.templateSwitched';
  payload: {
    oldTemplate: string;
    newTemplate: string;
  };
};

export type ShipLog = ShipRenamedLog | ShipTemplateSwitchedLog;
