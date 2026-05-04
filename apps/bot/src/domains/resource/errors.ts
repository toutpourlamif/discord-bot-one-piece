import type { ResourceName } from '@one-piece/db';

import { AppError } from '../../discord/errors.js';

export class InsufficientResourceError extends AppError {
  constructor(resourceName: ResourceName) {
    super(`Ressource insuffisante : ${resourceName}.`, 'warn');
    this.name = 'InsufficientResourceError';
  }
}
