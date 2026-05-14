const CREW_MORALE_MIN = -100;
const CREW_MORALE_MAX = 100;

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
  'Déterminé',
  'Combatif',
  'Enthousiaste',
  'Invincible',
  'Légendaire',
] as const;

const CREW_MORALE_PER_GRADE = (CREW_MORALE_MAX - CREW_MORALE_MIN) / CREW_MORALE_GRADES.length;

type CrewMoraleGrade = (typeof CREW_MORALE_GRADES)[number];

function clampCrewMorale(value: number): number {
  return Math.max(CREW_MORALE_MIN, Math.min(CREW_MORALE_MAX, value));
}

export function getCrewMoraleGrade(crewMorale: number): CrewMoraleGrade {
  const clamped = clampCrewMorale(crewMorale);

  const index = Math.min(CREW_MORALE_GRADES.length - 1, Math.floor((clamped - CREW_MORALE_MIN) / CREW_MORALE_PER_GRADE));

  return CREW_MORALE_GRADES[index]!;
}
