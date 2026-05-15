export const CONFIRM_SET_PREFIX_BUTTON_NAME = 'setprefixconfirm';
export const CANCEL_SET_PREFIX_BUTTON_NAME = 'setprefixcancel';
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
