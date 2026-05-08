import { PermissionFlagsBits, type PermissionsBitField } from 'discord.js';

import { ForbiddenError } from '../errors.js';

type Permissions = Pick<PermissionsBitField, 'has'>;

export function assertHasAdministratorPermission(permissions: Permissions | null | undefined): void {
  if (!permissions?.has(PermissionFlagsBits.Administrator)) {
    throw new ForbiddenError('Cette commande est réservée aux admins du serveur.');
  }
}
