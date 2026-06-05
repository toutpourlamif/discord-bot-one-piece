import type { SupportedLanguage } from '@one-piece/db';

export const texts = {
  introAlreadyStartedTitle: {
    fr: 'Ton aventure a déjà commencé !',
    en: 'Your adventure has already begun!',
  },
  introAlreadyStartedDescription: {
    fr: 'Tu es déjà en mer, pirate.',
    en: 'You are already at sea, pirate.',
  },
  completedTitle: {
    fr: 'Bon vent, pirate.',
    en: 'Fair winds, pirate.',
  },
  completedDescription: {
    fr: 'Ton aventure commence vraiment maintenant.',
    en: 'Your adventure truly begins now.',
  },
} satisfies Record<string, Record<SupportedLanguage, unknown>>;
