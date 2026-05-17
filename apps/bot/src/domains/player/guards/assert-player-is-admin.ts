import type { Player } from '@one-piece/db';

import { ForbiddenError } from '../../../discord/errors.js';

export function assertPlayerIsAdmin(player: Player): void {
  if (!player.isAdmin) {
    throw new ForbiddenError('Cette commande est réservée aux admins du jeu.');
  }
}
