import { ValidationError } from '../../../discord/errors.js';
import * as playerRepository from '../../player/repository.js';

export async function assertPlayerOwnsShip(playerId: number, discordId: string): Promise<void> {
  const player = await playerRepository.findByIdOrThrow(playerId);
  if (player.discordId === discordId) return;

  throw new ValidationError("Tu ne peux pas améliorer le navire de quelqu'un d'autre.");
}
