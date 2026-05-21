import { type Zone } from '@one-piece/db';
import sample from 'lodash/sample.js';

// TODO: Mettre des vrais trucs là c'est généré par l'IA
// TODO: Déclarer les calm text directement quand on définit une île.
const CALM_TEXT_BY_ZONE: Record<Zone, Array<string>> = {
  satsuruzo: [
    "Le port de Satsuruzo bruisse au loin. Vous prenez le temps d'observer les voiles.",
    "Une brise tranquille passe sur Satsuruzo. Rien ne presse l'équipage.",
    'Vous laissez le navire au mouillage. Le royaume semble calme pour l’instant.',
  ],
  dawn: [
    'Dawn Island s’étire sous le soleil. Le village vit sans se soucier de votre départ.',
    "Vous observez la côte de Dawn Island. L'air sent l'herbe chaude et la mer.",
    'Le royaume de Goa reste au loin. Vous profitez d’un rare moment tranquille.',
  ],
  goat: [
    'Goat Island somnole sous les embruns. Le navire grince doucement.',
    'Vous inspectez la côte basse de Goat Island. Rien à signaler.',
    "Quelques nuages passent au-dessus de l'île. L'équipage souffle un peu.",
  ],
  yotsuba: [
    'Les rues de Shells Town sont calmes. La Marine garde ses distances.',
    'Yotsuba Island semble paisible, mais personne ne baisse vraiment la garde.',
    'Vous regardez les collines autour de Shells Town. Le vent tourne lentement.',
  ],
  loguetown: [
    "Vous traînez sur la place de l'exécution. Un soldat de la Marine vous toise, sans bouger.",
    'Vous testez une lame chez un forgeron. Rien ne presse.',
    "Vous traversez les ruelles, l'odeur de poudre et d'épices colle à vos vêtements.",
  ],
  reverse_mountain: [
    'Vous contemplez les courants qui se rejoignent au sommet. Aucun voilier en approche.',
    'Le grondement de la montagne couvre vos pensées. Bon moment pour souffler.',
    "Vous coupez la voile. Le passage est à vous, pour l'instant.",
  ],
  whisky_peak: [
    "Vous observez les cactus géants. Aucun comité d'accueil — vous n'allez pas vous plaindre.",
    'Vous vous adossez à un rocher. Le silence de Whisky Peak est presque suspect.',
    "Un vent chaud balaie l'île. Personne pour vous accueillir, personne pour vous trahir.",
  ],
  little_garden: [
    'Vous écoutez la jungle. Un rugissement lointain — pas pour vous.',
    'Un dinosaure passe au loin, totalement indifférent à votre présence.',
    'Le sol tremble une seconde. Vous décidez de rester immobile.',
  ],
  drum: [
    "Vous frottez vos mains près d'un brasero. Personne ne vient vous déranger.",
    'Vous regardez la neige tomber sur le pont. Drum hiberne, et vous aussi.',
    "Une fumée s'élève d'un chalet voisin. Pas votre histoire — pas encore.",
  ],
  alabasta: [
    "Vous ajustez votre turban contre le sable. L'horizon est désert.",
    'Une caravane passe au loin. Vous la regardez sans bouger.',
    "Vous buvez une gorgée d'eau tiède. Le soleil cogne, mais vous patientez.",
  ],
  sea_east_blue: [
    "Vous balancez les pieds par-dessus bord. Une mouette passe. C'est tout.",
    'East Blue fait son boulot. Le navire glisse, le vent est mou.',
    'Vous reprisez une voile au calme. Rien à signaler, capitaine.',
  ],
  sea_paradise: [
    'Le ciel passe du soleil à la grêle en cinq minutes. Vous vous y faites.',
    "Vous suivez le Log Pose sans poser de questions. Pas d'autre programme.",
    'Paradise vous laisse tranquille. Profitez-en — ça ne durera pas.',
  ],
  sea_new_world: [
    'Le navire tangue sur une houle bizarre. Le Nouveau Monde respire, vous aussi.',
    "Un courant inconnu glisse sous la coque. Vous gardez l'œil ouvert, sans plus.",
    'Au loin, un orage gronde. Pas pour vous, pas encore.',
  ],
  wano: [
    'Les pétales tombent à votre rythme.',
    'Vous entendez un shamisen quelque part derrière les bambous.',
    'Vous vous asseyez sous un cerisier. Le vent fait tout le travail.',
    "L'odeur du thé persiste dans l'air.",
    'Un samouraï affûte sa lame au bord de la rivière. Vous échangez un regard.',
  ],
};

export function getRandomCalmTextByZone(zone: Zone): string {
  const picked = sample(CALM_TEXT_BY_ZONE[zone])!;
  return picked;
}
