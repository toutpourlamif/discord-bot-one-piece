export const SEAS = ['sea_east_blue', 'sea_paradise', 'sea_new_world'] as const;

export type Sea = (typeof SEAS)[number];

export const SEA_LABELS: Record<Sea, string> = {
  sea_east_blue: "Mer d'East Blue",
  sea_paradise: 'Mer de Paradise',
  sea_new_world: 'Mer du Nouveau Monde',
};
