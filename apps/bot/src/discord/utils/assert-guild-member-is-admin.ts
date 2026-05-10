import type { GuildMember, PermissionsBitField } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

import { ForbiddenError } from '../errors.js';

type MemberWithPermissions = Pick<GuildMember, 'permissions'>;
type Permissions = Pick<PermissionsBitField, 'has'>;

export function assertGuildMemberIsAdmin(member: MemberWithPermissions | null | undefined): void {
  assertPermissionsHaveAdministrator(member?.permissions);
}

export function assertPermissionsHaveAdministrator(permissions: Permissions | null | undefined): void {
  if (!permissions?.has(PermissionFlagsBits.Administrator)) {
    throw new ForbiddenError('Cette commande est réservée aux admins du serveur.');
  }
}
