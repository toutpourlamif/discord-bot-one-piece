const CREW_MORALE_MIN = -100;
const CREW_MORALE_MAX = +100;

const CREW_MORALE_GRADES = [
  'Mutinerie',
  'Révolté',
  'Démoralisé',
  'Brisé',
  'Épuisé',
  'Résigné',
  'Méfiant',
  'Tendu',
  'Instable',
  'Indifférent',
  'Neutre',
  'Correct',
  'Motivé',
  'Solidaire',
  'Soudé',
  'Détérminé',
  'Combatif',
  'Enthousiaste',
  'Invicible',
  'Légendaire',
] as const;

function clampCrewMorale(value: number): number {
  return Math.max(CREW_MORALE_MIN, Math.min(CREW_MORALE_MAX, value));
}

export function getCrewMoraleGrade(crewMorale: number): string {
  const clamped = clampCrewMorale(crewMorale);

  const index = Math.min(CREW_MORALE_GRADES.length - 1, Math.floor((clamped - CREW_MORALE_MIN) / 10));

  return CREW_MORALE_GRADES[index]!;
}
