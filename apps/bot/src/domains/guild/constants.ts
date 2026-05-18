export const CONFIRM_SET_PREFIX_BUTTON_NAME = 'setprefixconfirm';
export const CANCEL_SET_PREFIX_BUTTON_NAME = 'setprefixcancel';
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export const FR_BUTTON_NAME = 'fr';
export const EN_BUTTON_NAME = 'en';
export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  fr: '🇫🇷',
  en: '🇺🇸',
};
export const CONFIRM_SET_LANGUAGE_BUTTON_NAME = 'setlanguageconfirm';
export const CANCEL_SET_LANGUAGE_BUTTON_NAME = 'setlanguagecancel';
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
