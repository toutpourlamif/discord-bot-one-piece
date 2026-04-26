export type DomainName = 'devil_fruit' | 'resource' | 'character';

export const DOMAIN_LABEL: Record<DomainName, string> = {
  devil_fruit: 'Fruit du Démon',
  resource: 'Ressource',
  character: 'Personnage',
} as const;

export const DOMAIN_EMOJI: Record<DomainName, string> = {
  devil_fruit: '🍎',
  resource: '📦',
  character: '🏴‍☠️',
} as const;
