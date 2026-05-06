import { confirmShipModuleUpgradeButtonHandler } from './confirm-upgrade-button.js';
import { shipButtonHandler } from './ship-button.js';
import { upgradeShipButtonHandler } from './upgrade-button.js';
import { upgradeShipModuleButtonHandler } from './upgrade-module-button.js';

export const shipButtonHandlers = [
  shipButtonHandler,
  upgradeShipButtonHandler,
  upgradeShipModuleButtonHandler,
  confirmShipModuleUpgradeButtonHandler,
];
