export type AppErrorSeverity = 'warn' | 'error';

export class AppError extends Error {
  constructor(
    message: string,
    readonly severity: AppErrorSeverity,
    readonly userMessage = message,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Introuvable.') {
    super(message, 'warn');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'warn');
    this.name = 'ValidationError';
  }
}

export class InternalError extends AppError {
  constructor(message: string) {
    super(message, 'error', 'Une erreur est survenue, veuillez contacter un admin.');
    this.name = 'InternalError';
  }
}

export class AdminOnlyError extends AppError {
  constructor(message: string) {
    super(message, 'warn', 'Cette commande est réservée aux admins.');
    this.name = 'AdminOnlyError';
  }
}
