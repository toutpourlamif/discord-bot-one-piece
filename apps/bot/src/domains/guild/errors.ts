import { AppError } from '../../discord/errors.js';

export class ServerOnlyError extends AppError {
  constructor() {
    super('Le bot se joue uniquement sur un serveur Discord. Invite-le sur ton serveur ou rejoins-en un.', 'warn');
    this.name = 'ServerOnlyError';
  }
}
