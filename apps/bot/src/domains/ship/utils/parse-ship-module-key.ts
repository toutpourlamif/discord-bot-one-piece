import { SHIP_MODULE_KEYS, type ShipModuleKey } from '@one-piece/db';

import { ValidationError } from '../../../discord/errors.js';

export function parseShipModuleKey(value: string | undefined): ShipModuleKey {
  if (value && SHIP_MODULE_KEYS.includes(value as ShipModuleKey)) {
    return value as ShipModuleKey;
  }

  throw new ValidationError('Module de navire invalide.');
}
