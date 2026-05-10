import type { APIInteractionGuildMember } from 'discord.js';
import { GuildMember, PermissionFlagsBits } from 'discord.js';

import { ForbiddenError } from '../errors.js';

// `interaction.member` peut être un `APIInteractionGuildMember` (guild non cachée) dont `.permissions` est une string,
//  pas un `PermissionsBitField` — d'où le `instanceof GuildMember`.
// TODO: si ce check se reproduit ailleurs, le déplacer au niveau du router (narrow `inCachedGuild()` une fois pour toutes).
export function assertGuildMemberIsAdmin(member: GuildMember | APIInteractionGuildMember | null | undefined): void {
  const isAdmin = member instanceof GuildMember && member.permissions.has(PermissionFlagsBits.Administrator);
  if (!isAdmin) {
    throw new ForbiddenError('Cette commande est réservée aux admins du serveur.');
  }
}
