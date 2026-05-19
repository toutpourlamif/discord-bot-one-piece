import { pgEnum } from 'drizzle-orm/pg-core';

export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export const languageEnum = pgEnum('language', SUPPORTED_LANGUAGES);
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
