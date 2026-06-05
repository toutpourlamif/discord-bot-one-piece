import type { SupportedLanguage } from '@one-piece/db';

export type TranslationByLanguage = Record<SupportedLanguage, unknown>;
export type DomainTranslations = Record<string, TranslationByLanguage>;
