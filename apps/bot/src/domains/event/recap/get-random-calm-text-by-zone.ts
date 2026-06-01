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
    "L'île Dawn s’étire sous le soleil. Le village vit sans se soucier de votre départ.",
    "Vous observez la côte de l'île Dawn. L'air sent l'herbe chaude et la mer.",
    'Le royaume de Goa reste au loin. Vous profitez d’un rare moment tranquille.',
  ],
  goat: [
    "L'île Goat somnole sous les embruns. Le navire grince doucement.",
    "Vous inspectez la côte basse de l'île Goat. Rien à signaler.",
    "Quelques nuages passent au-dessus de l'île. L'équipage souffle un peu.",
  ],
  yotsuba: [
    'Les rues de Shells Town sont calmes. La Marine garde ses distances.',
    "L'île Yotsuba semble paisible, mais personne ne baisse vraiment la garde.",
    'Vous regardez les collines autour de Shells Town. Le vent tourne lentement.',
  ],
  mirrorball: [
    "L'île Mirrorball miroite sous le soleil. L'équipage profite du calme.",
    "Les façades de l'île Mirrorball renvoient la lumière jusqu'au port.",
    "Vous laissez le navire au mouillage. Rien ne bouge autour de l'île Mirrorball.",
  ],
  nagagutsu: [
    'Le royaume de Nagagutsu s’étire le long de la côte. Vous observez les quais.',
    'Une cloche sonne quelque part dans Nagagutsu. Personne ne semble pressé.',
    "Vous inspectez l'horizon depuis Nagagutsu. La mer reste tranquille.",
  ],
  organ: [
    "Les îlots de l'archipel Des Orgao restent silencieux sous la brume.",
    'Orange Town bruisse au loin. Pour l’instant, rien ne vient troubler le port.',
    "Vous suivez les petites vagues entre les îlots de l'archipel Des Orgao.",
  ],
  rare_animal: [
    'Des cris étranges montent de la jungle. Ils restent loin du campement.',
    "L'île des Animaux Rares respire doucement autour de vous. L'équipage parle bas.",
    'Vous comptez les silhouettes entre les arbres, puis vous abandonnez.',
  ],
  kumate: [
    "L'île Kumate dort sous un ciel clair. La mer clapote contre la coque.",
    "Vous longez les petites falaises de l'île Kumate. Rien d'urgent.",
    "Le vent tourne autour de l'île Kumate sans apporter de mauvaise nouvelle.",
  ],
  sixis: [
    "Sixis paraît abandonnée. C'est presque reposant.",
    "Vous ramassez du bois sec près de la plage de Sixis. L'île ne répond pas.",
    'Le silence de Sixis laisse tout le monde reprendre son souffle.',
  ],
  gecko: [
    'Syrup Village somnole derrière les collines. Le port reste calme.',
    "Les îles de l'archipel Gecko découpent l'horizon en petites ombres.",
    'Vous entendez une rumeur de village, puis seulement le bruit des vagues.',
  ],
  tequila_wolf: [
    "Le pont colossal de l'île Tequila Wolf disparaît dans la brume.",
    'Vous entendez au loin le martèlement régulier des chantiers.',
    "L'île Tequila Wolf s'étire sous un ciel pâle. Pour l'instant, personne ne vous arrête.",
  ],
  baratie: [
    'Les cuisines du Baratie s’agitent sans vous. Sur le pont, la mer reste calme.',
    "Vous sentez l'odeur d'un plat chaud passer au-dessus des vagues.",
    'Le restaurant flotte paisiblement. Personne ne cherche la bagarre pour l’instant.',
  ],
  conomi: [
    "L'archipel de Conomi se découpe en îlots tranquilles autour de vous.",
    'Cocoyasi paraît calme au loin. Le vent glisse entre les mandariniers.',
    'Vous observez les quais de Conomi. Rien ne bouge, sauf les vagues.',
  ],
  cozia: [
    'Cozia reste silencieuse sous le soleil. Le port tourne au ralenti.',
    'Vous faites le tour des quais de Cozia. Rien à signaler.',
    "Une brise légère traverse Cozia. L'équipage garde le cap au calme.",
  ],
  frauce: [
    'Le royaume de Frauce veille derrière ses murs. La mer est docile.',
    'Vous regardez les pavillons de Frauce claquer au vent.',
    'Frauce semble loin de toute agitation. Bon moment pour souffler.',
  ],
  oykot: [
    "Le royaume d'Oykot reste calme derrière ses quais.",
    "Vous observez la côte d'Oykot. Aucun navire suspect en approche.",
    "Une rumeur de marché arrive depuis Oykot, puis s'éteint dans le vent.",
  ],
  pole_star: [
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
