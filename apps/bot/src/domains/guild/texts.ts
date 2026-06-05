import type { SupportedLanguage } from '@one-piece/db';

export const texts = {
  setLanguageTitle: {
    fr: 'Langue du serveur',
    en: 'Server language',
  },
  setLanguageDescription: {
    fr: 'Dans quelle langue veux-tu que le bot te parle ?',
    en: 'Which language should the bot use?',
  },
} satisfies Record<string, Record<SupportedLanguage, unknown>>;
