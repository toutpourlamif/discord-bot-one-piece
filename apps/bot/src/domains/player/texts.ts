import type { SupportedLanguage } from '@one-piece/db';

export const texts = {
  renameMissingName: {
    fr: 'Tu dois donner un nom.',
    en: 'You must provide a name.',
  },
  renameSuccessTitle: {
    fr: 'Changement de nom effectué !',
    en: 'Name changed!',
  },
  renameSuccessDescription: {
    fr: (name: string) => `On vous connait désormais sous le nom de **${name}**.`,
    en: (name: string) => `You are now known as **${name}**.`,
  },
  karma: {
    fr: (grade: string, karma: number) => `Karma: ${grade} (${karma})`,
    en: (grade: string, karma: number) => `Karma: ${grade} (${karma})`,
  },
  crewMorale: {
    fr: (grade: string, crewMorale: number) => `Morale d'équipage: ${grade} (${crewMorale})`,
    en: (grade: string, crewMorale: number) => `Crew morale: ${grade} (${crewMorale})`,
  },
} satisfies Record<string, Record<SupportedLanguage, unknown>>;
