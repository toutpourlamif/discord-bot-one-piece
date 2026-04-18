export const EVENT_TYPES = {
  BARREL_FOUND: 'barrel_found',
  ISLAND_FOUND: 'island_found',
  FISH_ENCOUNTERED: 'fish_encountered',
  WEATHER_CHANGE: 'weather_change',
  RESTAURANT_SHIP_FOUND: 'restaurant_ship_found',
  MERCHANT_SHIP_ENCOUNTERED: 'merchant_ship_encountered',
  CASTAWAY_RESCUED: 'castaway_rescued',
  SHIPWRECK_DISCOVERED: 'shipwreck_discovered', // épave
  STRANGE_LIGHT_ON_HORIZON: 'strange_light_on_horizon', // narratif, rien de spécial
  ANCIENT_WEAPON_CLUE: 'ancient_weapon_clue',
  STORM_DAMAGE: 'storm_damage',
  PIRATE_ATTACK: 'pirate_attack',
  SEA_MONSTER_ATTACK: 'sea_monster_attack',
  CHEST_FOUND: 'chest_found',
  MESSAGE_IN_A_BOTTLE: 'message_in_a_bottle',
  CREW_ARGUMENT: 'crew_argument',
  HULL_BREACH: 'hull_breach', // Brèche dans la coque
} as const;
