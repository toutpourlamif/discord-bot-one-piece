import { db, type Ship } from '@one-piece/db';

import * as historyRepository from '../../history/index.js';
import * as shipRepository from '../repository.js';
import type { ShipTemplateKey } from '../templates.js';
import { buildShipTemplateState } from '../utils/index.js';

/** Change de navire : reset complet aux valeurs de départ du template (les niveaux investis sur l'ancien sont perdus). */
export async function switchShipTemplate(playerId: number, templateKey: ShipTemplateKey): Promise<Ship> {
  return db.transaction(async (transaction) => {
    const current = await shipRepository.findByPlayerIdOrThrow(playerId, transaction, { forUpdate: true });
    const updatedShip = await shipRepository.resetToTemplate(current.id, buildShipTemplateState(templateKey), transaction);

    await historyRepository.appendHistory({
      type: 'ship.templateSwitched',
      payload: { oldTemplate: current.templateKey, newTemplate: templateKey },
      actorPlayerId: playerId,
      target: { type: 'ship', id: updatedShip.id },
      client: transaction,
    });

    return updatedShip;
  });
}
