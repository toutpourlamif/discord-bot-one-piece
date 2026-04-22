const KARMA_MIN = -100;
const KARMA_MAX = 100;

const KARMA_GRADES = [
  'Infâme',
  'Maudit',
  'Impitoyable',
  'Cruel',
  'Sanguinaire',
  'Tyrannique',
  'Fourbe',
  'Louche',
  'Suspect',
  'Instable',
  'Neutre',
  'Correct',
  'Fiable',
  'Loyal',
  'Respectable',
  'Honorable',
  'Valeureux',
  'Noble',
  'Légendaire',
  'Héroïque',
] as const;

function clampKarma(value: number): number {
  return Math.max(KARMA_MIN, Math.min(KARMA_MAX, value));
}

export function getKarmaGrade(karma: number): string {
  const clamped = clampKarma(karma);

  const index = Math.min(KARMA_GRADES.length - 1, Math.floor((clamped - KARMA_MIN) / 10));

  return KARMA_GRADES[index]!;
}
