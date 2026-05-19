import { pgEnum } from 'drizzle-orm/pg-core';

export const languageEnum = pgEnum('language', ['fr', 'en'] as const);

export const SUPPORTED_LANGUAGES = languageEnum.enumValues;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
