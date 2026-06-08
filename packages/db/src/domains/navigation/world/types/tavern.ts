export type TavernActivityType = 'shop' | 'recruit' | 'blackjack' | 'juste-prix';

export type TavernConfig = {
  activities: Array<TavernActivityType>;
};
