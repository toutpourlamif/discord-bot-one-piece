export type TavernGameId = 'blackjack' | 'juste-prix';

export type TavernActivityType = 'shop' | 'recruit' | TavernGameId;

export type TavernKeeper = {
  name: string;
  /** Chemin vers le dossier du perso */
  assetPath: string;
  /** Répliques quand on entre dans la taverne */
  greetingLines: Array<string>;
};

export type TavernConfig = {
  tavernKeeper: TavernKeeper;
  activities: Array<TavernActivityType>;
};
