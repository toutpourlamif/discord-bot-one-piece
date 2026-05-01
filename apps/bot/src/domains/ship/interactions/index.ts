import { confirmShipModuleUpgradeButtonHandler } from './confirm-ship-module-upgrade.js';
import { shipButtonHandler } from './ship-button.js';
import { upgradeShipModuleButtonHandler } from './upgrade-ship-module.js';
import { upgradeShipButtonHandler } from './upgrade-ship.js';

export const shipButtonHandlers = [
  shipButtonHandler,
  upgradeShipButtonHandler,
  upgradeShipModuleButtonHandler,
  confirmShipModuleUpgradeButtonHandler,
];
