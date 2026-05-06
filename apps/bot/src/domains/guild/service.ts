import { Buffer } from 'node:buffer';

import { MAX_GUILD_PREFIX_LENGTH, type Guild } from '@one-piece/db';

import { ValidationError } from '../../discord/errors.js';

import * as guildRepository from './repository.js';

const WHITESPACE_REGEX = /\s/;

export function parseGuildPrefixArg(args: Array<string>): string {
  if (args.length !== 1) {
    throw new ValidationError('Donne exactement un mot. Ex: !setprefix $');
  }

  return validateGuildPrefix(args[0]!);
}

export function encodeGuildPrefix(prefix: string): string {
  return Buffer.from(prefix, 'utf8').toString('base64url');
}

export function decodeGuildPrefix(encodedPrefix: string | undefined): string {
  if (!encodedPrefix) {
    throw new ValidationError('Préfixe introuvable.');
  }

  return validateGuildPrefix(Buffer.from(encodedPrefix, 'base64url').toString('utf8'));
}

export async function updatePrefix(guildId: string, prefix: string): Promise<Guild> {
  return guildRepository.updatePrefix(guildId, validateGuildPrefix(prefix));
}

function validateGuildPrefix(prefix: string): string {
  if (prefix.length < 1 || prefix.length > MAX_GUILD_PREFIX_LENGTH) {
    throw new ValidationError('Le préfixe doit faire entre 1 et 8 caractères.');
  }

  if (WHITESPACE_REGEX.test(prefix)) {
    throw new ValidationError("Le préfixe ne peut pas contenir d'espace.");
  }

  return prefix;
}
