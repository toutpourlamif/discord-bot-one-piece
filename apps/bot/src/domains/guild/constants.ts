import type { SupportedLanguage } from '@one-piece/db';

export const CONFIRM_SET_PREFIX_BUTTON_NAME = 'setprefixconfirm';
export const SELECT_LANGUAGE_BUTTON_NAME = 'setlanguageselect';
export const CONFIRM_SET_LANGUAGE_BUTTON_NAME = 'setlanguageconfirm';

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
};
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  fr: 'français',
  en: 'anglais',
};
