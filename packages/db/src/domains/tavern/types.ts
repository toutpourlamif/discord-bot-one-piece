export type TavernActivityType = 'shop' | 'recruit' | 'blackjack' | 'juste-prix';

export type TavernKeeper = {
  name: string;
  /** Chemin vers le dossier du perso */
  assetPath: string;
};

export type TavernConfig = {
  keeper: TavernKeeper;
  activities: Array<TavernActivityType>;
};
