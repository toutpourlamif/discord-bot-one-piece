import { AppError } from '../../discord/errors.js';

export class InsufficientFundsError extends AppError {
  constructor() {
    super('Fonds insuffisants.', 'warn');
  }
}
