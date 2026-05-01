# Domaine : event

## Concept

Un **event** c'est quelque chose qui arrive au joueur dans le monde du jeu : son équipage pêche un baril, il croise un autre pirate, il tombe sur Crocodile, une vague secoue son navire. Le joueur découvre ses events via la commande `!recap`.

Un event n'est **jamais déclenché à la demande** : il est calculé en fonction du temps qui s'est écoulé, de la zone du joueur, et de son passé. Le moteur cherche en permanence ce qui aurait pu se passer pendant qu'il était AFK.

---

## La grande décision : tout se calcule au moment du `!recap`

On a deux écoles possibles pour faire vivre un monde persistant comme celui-ci :

### École 1 — Le serveur qui tourne 24/24 (cron tick)

Un script qui se réveille toutes les N minutes (1 min, 5 min, peu importe), parcourt tous les joueurs actifs, et leur génère des events au fil du temps. Quand le joueur fait `!recap`, on lui sert ce qui a été pré-calculé.

> **Cron** = un programme qui s'exécute automatiquement à intervalle régulier (le mot vient des programmes Unix `crontab` qui font ça depuis 50 ans).
>
> **Tick** = un cycle d'horloge du moteur de jeu. Dans un MMO classique, un tick = un battement où le serveur recalcule l'état du monde.

### École 2 — Tout en lazy (à la demande)

Aucun script en background. Tant que personne ne joue, le bot dort. Quand un joueur tape `!recap`, on calcule à la volée tout ce qui aurait pu lui arriver depuis sa dernière visite.

> **Lazy** = "paresseux". Le calcul n'est fait qu'au moment où on en a besoin, pas avant.

### Notre choix : École 2 (lazy)

**Pourquoi :**

- **Coût d'infra zéro** quand personne ne joue. Beaucoup de bots Discord ont 90% de joueurs inactifs à un moment donné. Avec un cron tick, on ferait du calcul pour rien sur ces 90%.
- **Simplicité de déploiement.** Pas de scheduler, pas de jobs en background, pas de gestion de "qu'est-ce qui se passe si le bot redémarre pendant un tick ?". Le bot est purement réactif.
- **Local dev trivial.** Pas de cron qui interfère, on peut tourner le bot dans un terminal et tout est cohérent.
- **Failure mode propre.** Avec un cron, si le bot a été down pendant 4h on a "manqué" 4h de ticks → faut prévoir un catch-up. Avec lazy, le `!recap` recompute toujours depuis `last_recap_at`, peu importe les downtimes.

**Ce qu'on perd :**

- Le sentiment "le monde tourne même quand je regarde pas". Mais on va voir qu'avec le seed déterministe (plus bas), ce sentiment est préservé : deux joueurs voient bien le même monde, juste que le calcul est différé.
- Les events qui devraient avoir une "date de péremption" exacte (genre une vente flash limitée à 30 min) sont moins naturels en lazy. Pour notre jeu, pas de souci.

---

## Règle fondatrice : tu dois être synchro pour agir

**Toute action qui modifie le monde (pêcher, recruter, naviguer, combattre, acheter) nécessite que le joueur soit à jour dans son `!recap`.**

Concrètement, le joueur doit remplir deux conditions pour agir :

1. Son `last_recap_at` est égal à la fin du dernier bucket complet (= il a vécu tous ses events passés).
2. Il n'a pas d'`event_instance` pending (= il n'y a pas un stateful qui attend qu'il fasse un choix).

Si l'une des deux n'est pas respectée, le bot répond gentiment :

> "Tu as des events en attente. Tape `!recap` pour les vivre avant d'agir."

### Pourquoi cette règle change tout

Sans cette règle, on a un problème de cohérence temporelle : un joueur AFK peut subir une attaque à 14h00 dans le timeline du monde, mais s'il tape `!pêcher` à 23h00 sans avoir recap, son équipage est encore "frais" et il agit comme si rien ne s'était passé. Le bot devrait alors retconne son state, ré-appliquer les conséquences passées, etc. Compliqué et incohérent.

Avec cette règle, **le joueur traverse son passé avant d'altérer le présent**. Quand il tape `!pêcher` à 23h00, il a forcément vécu son `!recap` qui a appliqué tous les events depuis 12h. Son state est synchro avec le monde. Il peut agir.

### Conséquences en cascade

Cette règle simplifie énormément le moteur :

- **Plus aucune incohérence temporelle.** Un joueur synchro est synchro, point.
- **`!recap` devient un passage obligé**, pas une commande optionnelle qu'on peut zapper.
- **Pas besoin de `target_effects` dans `history`** pour les events cross-player. Quand un encounter a lieu, les deux joueurs sont synchros par construction (cf section cross-player) → on peut INSERT direct l'event_instance pour les deux.
- **Pas de fast-forward d'autres joueurs** nécessaire : si A regarde l'état de B, l'état de B est forcément à jour avec son `last_recap_at`.

### UX au retour d'AFK

Un joueur revient après 6h d'absence. Il tape `!naviguer`. Le bot lui dit :

> "Tu as 24 events en attente, dont une attaque de Hakim. Tape `!recap` pour les vivre."

Il tape `!recap`, traverse son timeline (events ambient affichés, stateful résolus un par un), arrive au présent, et là seulement peut naviguer. C'est immersif : il **rentre dans le monde** au lieu d'agir comme s'il ne l'avait jamais quitté.

### Implémentation : un middleware sur les commandes

Au routeur Discord, un middleware appliqué aux commandes "actives" (toutes sauf `!recap`, `!profil`, `!aide`) :

```ts
async function requireSyncedPlayer(playerId, message): Promise<boolean> {
  const isSynced = await isPlayerCaughtUp(playerId);
  if (!isSynced) {
    await message.reply({
      embeds: [
        /* "tape !recap d'abord" */
      ],
    });
    return false;
  }
  return true;
}
```

`isPlayerCaughtUp` vérifie les deux conditions (last_recap_at à jour + pas d'event_instance pending).

---

## Le temps découpé en buckets

Si on calcule "à la volée" tout ce qui a pu arriver entre 12h00 et 18h00, il faut quand même un découpage : on ne peut pas dire "à 14h32:17.453 il s'est passé X" — c'est trop fin et on ne peut pas calculer un infini de moments. On découpe donc le temps en **tranches fixes**.

> **Bucket** = "seau" en anglais. Une tranche de temps de durée fixe. On range tout ce qui arrive dans cette tranche dans le même seau.

```
12h00 ─── bucket A ─── 12h15 ─── bucket B ─── 12h30 ─── bucket C ─── 12h45 ...
```

### Comment on identifie un bucket

Chaque bucket est identifié par un nombre entier, calculé à partir du temps :

```
bucket_id = floor(epoch_seconds / 900)
```

- `epoch_seconds` = nombre de secondes depuis le 1er janvier 1970 (= ce que renvoie `Date.now() / 1000`).
- `floor(...)` = arrondi à l'entier inférieur.
- `900` = 15 × 60 secondes (la durée d'un bucket).

Donc le bucket du 30 avril 2026 à 14h00 UTC = `floor(1809184000 / 900) = 2010204`. C'est juste un entier qu'on peut stocker, comparer, indexer en DB, sans se soucier des fuseaux horaires.

### Pourquoi 15 minutes ?

Le choix de la durée joue sur trois leviers :

- **Coût du calcul au recap.** Plus le bucket est court, plus il y a de buckets à rejouer. Avec un cap de 48h sur le `!recap` (cf plus bas) : 5 min → 576 buckets, 15 min → 192 buckets, 1h → 48 buckets. À 192 c'est tout à fait gérable, à 576 ça commence à compter quand 50 joueurs recap en même temps.

- **Densité de rencontres entre joueurs.** Deux joueurs partagent un bucket s'ils sont online dans la même zone pendant la même tranche. Bucket de 5 min → ils doivent se chevaucher pendant 5 min précises. Bucket de 1h → 12 fois plus de chances. Trop court tue les rencontres, trop long les rend floues ("vous vous êtes croisés ce matin").

- **Granularité ressentie.** Quand on affiche "à 14h00 t'as croisé Hakim", "14h00" représente une tranche de 15 min. Si on était à 1h, ça serait "ce matin" — flou. À 5 min ça serait "à 14h00 précises" — plus excitant mais moins lisible.

15 minutes est le compromis qu'on retient. **C'est tunable** (juste une constante), donc si on change d'avis on règle un nombre.

### Si on n'avait pas découpé en buckets

Sans cette grille fixe, on serait obligés soit :

- de stocker pour chaque joueur "j'ai consulté le monde la dernière fois à 14h32:17", et de générer des events précis à la seconde — mais alors deux joueurs dans la même zone ne pourraient jamais se "croiser" parce que leurs timelines sont décalées,
- soit de pré-calculer un timeline global au tick (école 1).

Le bucket est ce qui permet de réconcilier "calcul lazy" et "monde partagé".

---

## Le seed déterministe : la magie qui fait que les joueurs voient le même monde

> **Seed** = une "graine" pour un générateur pseudo-aléatoire. À partir d'un seed donné, on tire toujours la même séquence de nombres "aléatoires". C'est ce qui rend les jeux comme Minecraft reproductibles : même seed = même monde généré.
>
> **Hash** = une fonction qui prend une entrée et la transforme en nombre. Deux entrées identiques donnent toujours la même sortie ; deux entrées différentes donnent presque toujours des sorties différentes.

Pour chaque bucket et chaque zone, on calcule un seed :

```
seed = hash(bucket_id, zone_id)
```

C'est juste un nombre déterministe qui dépend uniquement du bucket et de la zone. Ce seed sert à initialiser le générateur d'aléatoire (`rng`) qu'on utilise pour décider :

- est-ce qu'un baril apparaît à ce bucket dans cette zone ?
- est-ce que deux joueurs présents se rencontrent ?
- combien de berries y a-t-il dans le baril ?

### Le truc magique

**Deux joueurs qui calculent le seed du bucket 14h00 dans la zone "East Blue" obtiennent exactement le même seed.**

Conséquence : si Rayan recap à 18h et que le seed du bucket 14h dit "rencontre avec Hakim", quand Hakim recap plus tard à 19h, son moteur calculera le même seed pour le même bucket et la même zone, et tirera la même rencontre. **Pas besoin que l'un "écrive" pour l'autre, le hasard est partagé.**

### Si on n'avait pas fait ça

Trois alternatives possibles, toutes pires :

- **Random "vrai" (non seedé).** Chaque recap génère un random différent. Si Rayan voit "rencontre avec Hakim" à 14h, Hakim ne le verra jamais. Désynchronisé, RP cassé.
- **Une table "encounter" partagée écrite par le premier qui recap.** Ça marche, mais ça oblige le premier joueur à écrire pour le second → couplage, race conditions, complexité.
- **Le cron tick** (école 1). Le serveur écrit pour tous les joueurs au tick. Marche aussi, mais on a vu pourquoi on ne veut pas de cron.

Le seed déterministe est la solution élégante : pas d'écriture partagée, pas de cron, et tout le monde voit le même monde.

---

## Comment se passe un `!recap`

Le joueur a une colonne `last_recap_at` sur sa ligne `player`. C'est le moment jusqu'auquel on a déjà traité ses buckets.

> **`last_recap_at`** = "dernière fois qu'on a recap". Pas exactement : c'est plutôt "jusqu'à quel point dans le temps on a déjà calculé ses events". Va aussi pouvoir reculer si un stateful nous fait freezer (voir plus bas).

Quand le joueur tape `!recap` à 18h00, et que `last_recap_at = 12h00` :

1. On calcule la liste des buckets entre 12h00 et 18h00 → 24 buckets (à 15 min chacun).
2. On parcourt chaque bucket dans l'ordre chronologique.
3. Pour chaque bucket, on tente de générer des events.
4. On affiche le résultat.
5. On avance `last_recap_at`.

Toute cette opération tourne dans **une seule transaction Drizzle**.

> **Transaction** = un bloc de modifications de la base qui sont soit toutes appliquées, soit toutes annulées. Si quelque chose plante au milieu, on revient à l'état d'avant — pas de modification partielle.

Pourquoi c'est important : si on a appliqué un effet ambient (genre +50 berries) et qu'ensuite l'INSERT de l'event_instance échoue, sans transaction le joueur garderait les berries mais sans la trace de l'event. Avec la transaction, soit tout passe, soit rien.

### Cap : on remonte au max 48h dans le passé

Si un joueur revient après 5 jours d'AFK, on ne rejoue pas 5 jours de buckets. On cap à 48h avant `now()`. Le reste est perdu.

**Pourquoi un cap :**

- Performance : 5 jours × 96 buckets/jour = 480 buckets à traiter, ça commence à coûter.
- Game design : on veut que le `!recap` raconte "ce qui s'est passé récemment", pas "ce qui s'est passé pendant ton mois de vacances".
- Sinon faudrait imaginer "compresser" 5 jours de buckets en quelques events représentatifs, c'est un autre niveau de complexité.

48h est arbitraire, ajustable.

---

## Les deux types d'events

Tous les events ne se ressemblent pas. On distingue deux familles :

### 1. Ambient (passifs, jamais persistés)

Petits events décoratifs ou à effet immédiat. Pas de choix à faire pour le joueur.

> _"À 14h15, une vague a secoué ton navire. Ton équipage perd 2 de moral."_
>
> _"À 14h30, ton équipage a aperçu une mouette."_

Ces events sont **calculés à la volée**, affichés dans le recap, et leurs effets éventuels (gain de berries, perte de moral) sont appliqués dans la transaction du recap. Une fois le recap terminé, ils n'existent plus en tant que ligne en base — juste une trace dans `history`.

### 2. Stateful (interactifs, persistés)

Events qui demandent une décision du joueur, ou qui s'étalent dans le temps.

> _"À 14h45, tu as repéré un baril qui flotte. [Ouvrir] [Laisser]"_
>
> _"À 15h00, Crocodile se dresse devant toi. [Attaquer] [Charger Haki]"_

Ces events sont **persistés** dans une table dédiée `event_instance`. Tant que le joueur n'a pas cliqué un bouton, l'event reste "en attente". Il peut prendre tout son temps.

> **Stateful** = "qui porte un état". Un event stateful a une vie : il est créé, il attend, il est mis à jour à chaque clic, il finit par être résolu et disparaître. Un event ambient est l'inverse : "stateless", il existe juste le temps de l'affichage et puis pouf.

### Pourquoi cette séparation

On pourrait tout traiter pareil (tout persister), mais :

- Les events ambient sont nombreux (un par bucket facilement) et n'ont aucun besoin de mémoire — leur unique trace utile c'est `history` pour les stats et les conditions futures.
- Les events stateful sont rares (1 max par joueur à un instant T, on va voir pourquoi) mais ont besoin de survivre entre deux recaps puisque le joueur peut prendre du temps pour décider.

Persister les ambient gonflerait la table `event_instance` pour rien, alors qu'on en supprimerait 99% sans interaction. Au contraire, ne pas persister les stateful nous obligerait à les recalculer à chaque recap, ce qui pose problème : si l'aléatoire intervient au moment de la résolution (genre "tu tires les dégâts"), on ne peut pas re-tirer à chaque vue, sinon le joueur peut "rerouler" en cliquant deux fois.

---

## La table `event_instance`

| Colonne        | Type         | À quoi ça sert                                                     |
| -------------- | ------------ | ------------------------------------------------------------------ |
| `id`           | bigserial PK | identifiant unique                                                 |
| `player_id`    | integer FK   | à qui appartient cet event                                         |
| `type`         | text         | identifiant du générateur (ex: `mainstory.alabasta.find_map`)      |
| `bucket_id`    | bigint       | le bucket dans lequel l'event a été tiré                           |
| `encounter_id` | bigint, null | pour relier les events cross-player (deux lignes liées par cet id) |
| `state`        | jsonb        | étape actuelle si l'event est multi-étapes                         |
| `created_at`   | timestamptz  | quand on a créé la ligne                                           |

> **`bigserial`** = un compteur entier auto-incrémenté en bigint (= entier 64 bits, capable de monter très haut sans overflow). On utilise `bigserial` quand on s'attend à beaucoup de lignes au fil du temps.
>
> **PK** = "primary key", la colonne qui identifie de manière unique chaque ligne.
>
> **FK** = "foreign key", une colonne qui référence la PK d'une autre table. Ici `player_id` est une FK vers `player(id)` — le moteur DB s'assure qu'on ne peut pas mettre un `player_id` qui n'existe pas.
>
> **`jsonb`** = type Postgres pour stocker du JSON binaire (interrogeable, indexable). On l'utilise pour les payloads dont la forme varie d'un event à l'autre — on n'aurait pas envie de créer une colonne par champ possible.

**Unique sur `(player_id, type, bucket_id)`** : on ne peut pas créer deux fois le même event pour le même joueur sur le même bucket. C'est l'**idempotence**.

> **Idempotence** = la propriété d'une opération qui peut être appelée plusieurs fois sans changer le résultat après le premier appel. Si je tape deux fois sur "envoyer email", j'envoie deux mails (pas idempotent). Si je tape deux fois sur "marquer comme lu", c'est lu pareil (idempotent).

Pourquoi c'est crucial ici : si le joueur tape `!recap` deux fois, le moteur va vouloir générer le même event à partir du même seed. L'unique constraint refuse le doublon → on skip → pas de duplicata.

### Une fois résolu, on supprime

L'historique du jeu vit dans la table `history` (qui, elle, est append-only — voir doc `history.md`). `event_instance` ne contient que ce qui est en cours. Une fois qu'un event est résolu, sa ligne est supprimée et la trace de la résolution part dans `history`.

> **Append-only** = on ne fait que rajouter des lignes, jamais d'UPDATE ni de DELETE. C'est le mode de la table `history`. Au contraire, `event_instance` n'est pas append-only : on UPDATE le `state` à chaque transition, on DELETE à la résolution. C'est pas un log, c'est un "panier en cours".

### Pourquoi pas un champ `status` ?

On aurait pu garder la ligne avec un `status: 'resolved'` au lieu de la supprimer. Inconvénient : la table grossirait indéfiniment, alors qu'on n'a aucun usage des resolved (l'info utile est dans `history`). Supprimer est plus propre, et plus économe en index.

---

## Règle d'or : un seul stateful en attente à la fois par joueur

Pour garder une narration linéaire et éviter de noyer le joueur, **un joueur ne peut avoir qu'un seul event stateful en attente à la fois**.

### Mécanique

Pendant le rejeu des buckets :

- Dès qu'un bucket génère un event stateful, on l'insère dans `event_instance` et **on s'arrête**.
- `last_recap_at` est figé au début de ce bucket (donc on n'avance pas).
- Tant que ce stateful n'est pas résolu, `!recap` ne fait que ré-afficher l'event en attente avec ses boutons.
- Une fois résolu, `!recap` reprend là où il s'est arrêté, traite les buckets suivants, etc.

### Pourquoi ce choix

L'expérience du joueur devient un rythme : tu vois ce qui s'est passé → tu fais un choix → tu continues → tu fais un choix → etc. Plutôt que de te balancer 8 décisions d'un coup où tu sais pas par où commencer.

### Si on avait fait autrement

- **Plusieurs stateful en parallèle** : on pourrait, mais le joueur se retrouve devant un menu de quêtes. Plus complexe à modéliser, plus dur à présenter en UI, et casse la narration linéaire qu'on veut pour la mainstory.
- **Aucun stateful, tout résolu en un clic au moment du recap** : ferait perdre le côté "tu prends une décision et tu vis avec". Et certains events doivent rester ouverts longtemps (un combat de mainstory peut être laissé en suspens si le joueur veut s'équiper avant).

### Et si plusieurs générateurs candidatent sur le même bucket ?

Un bucket peut générer plein d'events ambient mais **au plus un seul stateful**. Si plusieurs générateurs stateful "candidatent" sur le même bucket (ex: combat ET pêche d'un kraken), on en pick un seul (tirage pondéré par leur `weight`). Les autres sont skippés pour ce bucket.

Pourquoi un seul : pour que le `bucket_id` reste un identifiant fiable du contexte. Si on en empilait deux, il faudrait soit les jouer en série (et dans quel ordre ?), soit les rendre simultanés (et là le joueur a deux events à arbitrer en même temps).

---

## Le générateur d'event

C'est l'objet qui définit quand et comment un event apparaît. **Un fichier par générateur** (cf section organisation des fichiers).

### Forme générale (ambient)

```ts
const seagullFlyby: EventGenerator = {
  type: 'ambient.seagull_flyby',
  scope: 'ambient',

  conditions: (ctx) => ctx.zone === 'east_blue', // optionnel
  cooldown: 1800, // optionnel : 30 min, lookup dans history
  probability: () => 0.3, // 30% de chance par bucket éligible

  build: (ctx, rng) => ({
    embed: makeEmbed('Une mouette passe au-dessus du navire.'),
    effects: [], // ou [{ type: 'addMorale', amount: 1 }]
  }),
};
```

### Forme générale (stateful, simple)

```ts
const barrelFound: EventGenerator = {
  type: 'fishing.barrel_found',
  scope: 'stateful',
  probability: () => 0.1,

  initial: 'choice', // nom de l'étape de départ
  steps: {
    choice: {
      embed: () => makeEmbed('Un baril flotte près du navire.'),
      choices: () => [
        { id: 'open', label: 'Ouvrir', resolve: openBarrel },
        { id: 'leave', label: 'Laisser', resolve: leaveBarrel },
      ],
    },
  },
};

function openBarrel(ctx, rng) {
  const berries = 50 + Math.floor(rng.next() * 100);
  return {
    embed: makeEmbed(`Tu trouves ${berries} berries dans le baril.`),
    effects: [{ type: 'addBerries', amount: BigInt(berries) }],
    resolutionType: 'fishing.barrel_found.opened',
  };
}

function leaveBarrel() {
  return {
    embed: makeEmbed('Tu passes ton chemin.'),
    effects: [],
    resolutionType: 'fishing.barrel_found.left',
  };
}
```

Tu remarques :

- **`build`** est utilisé pour les ambient (un seul écran, pas d'interaction).
- **`steps`** est utilisé pour les stateful. Chaque étape a un nom, un embed, et des choix.
- Chaque **choix** a soit `goTo` (transition vers une autre étape) soit `resolve` (résolution finale).
- À la résolution, on retourne `embed` (le résultat narratif), `effects` (les conséquences mécaniques), et `resolutionType` (un identifiant qui partira dans `history`).

### Forme général (stateful multi-étapes avec branches)

C'est là que ça devient intéressant. Plusieurs étapes, des transitions, des choix qui mènent à d'autres choix.

```ts
const defeatCrocodile: EventGenerator = {
  type: 'mainstory.alabasta.defeat_crocodile',
  scope: 'stateful',
  conditions: (ctx) => ctx.history.has('mainstory.alabasta.save_vivi.resolved') && ctx.player.hasItem('haki_basic'),
  probability: () => 1.0,

  initial: 'opener',
  steps: {
    opener: {
      embed: () => makeEmbed('Crocodile se dresse devant toi.'),
      choices: () => [
        { id: 'haki', label: 'Charger ton Haki', goTo: 'haki_charged' },
        { id: 'attack', label: 'Attaquer direct', resolve: fightLow },
      ],
    },
    haki_charged: {
      embed: () => makeEmbed("Ton Haki s'éveille. Tu sens une faille dans sa garde."),
      choices: () => [{ id: 'strike', label: 'Frapper', resolve: fightHigh }],
    },
  },
};

const fightLow = (ctx, rng) => fight(rng, 0.4);
const fightHigh = (ctx, rng) => fight(rng, 0.7);

function fight(rng, successRate) {
  if (rng.next() < successRate) {
    return {
      embed: makeEmbed('Tu terrasses Crocodile !'),
      effects: [{ type: 'addBounty', amount: 81_000_000n }],
      resolutionType: 'mainstory.alabasta.defeat_crocodile.won',
    };
  }
  return {
    embed: makeEmbed("Crocodile t'envoie au tapis."),
    effects: [{ type: 'addStatus', status: 'wounded' }],
    resolutionType: 'mainstory.alabasta.defeat_crocodile.lost',
  };
}
```

Tu peux faire 3 étapes, 8 étapes, des étapes qui se rejoignent, des étapes circulaires si tu veux. Le `state` jsonb stocke juste le nom de l'étape courante (`{ step: 'haki_charged' }`).

### Pourquoi un graphe d'étapes nommées et pas un gros switch

On aurait pu faire le pattern :

```ts
step: (choiceId, state, ctx, rng) => {
  if (state.step === 'opener' && choiceId === 'haki') return ...;
  if (state.step === 'opener' && choiceId === 'attack') return ...;
  if (state.step === 'haki_charged' && choiceId === 'strike') return ...;
  // 8 étapes → switch géant
}
```

Pour 1-2 étapes c'est OK, mais ça devient une soupe de `if` dès que ça grossit. Avec le graphe d'étapes :

- chaque étape est nommée explicitement,
- chaque choix dit clairement ce qu'il fait (`goTo` ou `resolve`),
- la dispatch `state.step → handler` est faite **par l'engine**, pas par toi,
- tu peux reuser `fightLow` / `fightHigh` sans gymnastique.

Surtout, c'est lisible : ouvre le fichier, tu vois le graphe.

### Logique conditionnelle dans les étapes

`embed`, `choices` et `resolve` sont tous des fonctions qui reçoivent `ctx`. Tu peux donc adapter à l'état du joueur en temps réel.

```ts
{
  meet: {
    embed: (ctx) => {
      const greeting = ctx.crew.has('nami')
        ? "« Tiens, encore une navigatrice... »"
        : "« Bonjour capitaine. »";
      return makeEmbed(`${greeting}\nIl te propose un Eternal Pose.`);
    },

    choices: (ctx) => [
      // Toujours dispo
      { id: 'leave', label: 'Passer', resolve: leaveMerchant },

      // Marchander : nécessite Nami
      ctx.crew.has('nami') && {
        id: 'haggle',
        label: 'Marchander (Nami)',
        goTo: 'haggle_attempt',
      },

      // Acheter au prix fort : nécessite 100 000 berries
      ctx.player.berries >= 100_000n && {
        id: 'buy',
        label: 'Acheter (100 000 ฿)',
        resolve: buyMerchant,
      },
    ].filter(Boolean),
  },
}
```

On filtre les choix non-éligibles plutôt que de les griser : moins de bruit visuel pour le joueur. Cohérent avec ce qu'on fait ailleurs dans le bot (cf `set-captain.ts`).

---

## Filtres au niveau du générateur

Avant qu'un générateur ne soit considéré pour un bucket, plusieurs filtres peuvent l'écarter :

### `conditions` — filtre dur

Si la fonction renvoie `false`, on saute. Aucune proba ne peut "rattraper" un `false`.

Exemple : "le joueur doit être en zone X", "il doit avoir tel personnage dans son équipage". Différent de la `probability` parce que c'est binaire et basé sur l'état du jeu.

### `cooldown` — anti-spam

Si le générateur a un `cooldown: 86400` (24h), on lookup `history` :

> "Ce joueur a-t-il déjà déclenché un event de type `X` dans les 24 dernières heures ?"

Si oui, on saute. Sinon on continue (et la proba s'applique).

### `oneTime` — une seule fois dans la vie

Si `oneTime: true`, on lookup `history` :

> "Ce joueur a-t-il déjà déclenché cet event ne serait-ce qu'une fois dans sa vie ?"

Si oui, on saute. Pratique pour la mainstory : on ne sauve pas Vivi deux fois.

### `probability` — le tirage final

Une fois les filtres passés, on tire un dé. `probability(ctx)` retourne un nombre entre 0 et 1. Le moteur compare avec un random pris depuis le seed du bucket : `rng.next() < probability(ctx)`.

### Pourquoi ces filtres lisent tous `history`

C'est exactement à ça que sert la table `history` (cf doc dédiée). Elle archive tout ce qui s'est passé. Au lieu d'ajouter une colonne par compteur sur `player` (`barrel_count_24h`, `kraken_count_lifetime`, ...), on a une seule table de logs et chaque générateur lit ce qu'il veut.

Avantage immense : ajouter un nouveau type de filtre ne demande aucune migration. Il suffit d'écrire la condition dans le générateur.

---

## Cross-player : la rencontre entre deux joueurs

Quand deux joueurs sont dans la même zone et que le seed dit "il y a une rencontre", on matérialise l'event **pour les deux**.

### Comment on sait qui était dans quelle zone à un bucket donné

C'est crucial : pour vérifier "qui était dans la zone Z à T", on a besoin de l'historique des zones de **tous les joueurs**, pas juste celui qui recap.

On utilise une table dédiée **`zone_presence`** :

| Colonne      | Type        | À quoi ça sert                                          |
| ------------ | ----------- | ------------------------------------------------------- |
| `player_id`  | integer FK  |                                                         |
| `zone`       | enum        | la zone occupée                                         |
| `entered_at` | timestamptz | quand le joueur est entré dans cette zone               |
| `left_at`    | timestamptz | quand il l'a quittée — `NULL` si c'est sa zone actuelle |

PK : `(player_id, entered_at)`.
Index principal : `(zone, entered_at, left_at)` pour les requêtes "qui était dans Z à T".

C'est un **historique dédié aux zones**, mais structuré comme des **intervalles** (entrée → sortie) au lieu d'événements ponctuels.

#### Pourquoi pas se contenter de `history`

On pourrait dériver l'info de `history.player.zone_changed` seul. Ça marche mais la requête "qui était dans Z à T" devient :

> "Pour tous les joueurs, trouver leur dernier `player.zone_changed` avant T, filtrer ceux dont le `toZone` vaut Z."

C'est une window function lourde, mal couverte par un simple index. À 1000 joueurs ça commence à cramer.

Avec `zone_presence` la même question devient un simple range query, indexable directement :

```sql
SELECT player_id FROM zone_presence
WHERE zone = 'east_blue'
  AND entered_at <= '14:00'
  AND (left_at IS NULL OR left_at > '14:00')
```

> **Projection dénormalisée** = une copie d'une info déjà stockée ailleurs, mais structurée autrement pour optimiser un cas de lecture précis. C'est un pattern courant en DB quand un seul "stockage canonique" ne couvre pas tous les usages efficacement.

#### Maintenance des deux sources

À chaque changement de zone d'un joueur, dans la même transaction Drizzle :

1. UPDATE la ligne courante de `zone_presence` : `left_at = <timestamp du bucket>`.
2. INSERT une nouvelle ligne : `entered_at = <timestamp du bucket>, left_at = NULL`.
3. Append à `history` un `player.zone_changed` (pour les analytics et la cohérence du modèle history).

Comme tout vit dans la même transaction, les deux sources sont toujours synchronisées : pas de drift possible.

### Cohérence temporelle : tout reste cohérent grâce à la règle "synchro pour agir"

Comme on a posé qu'**aucun joueur ne peut agir sans être synchro**, deux joueurs qui s'encountent sont forcément tous les deux à jour dans leur timeline. Pas de retcon possible, pas de divergence entre `zone_presence` et `history`.

Quand un event tiré au bucket B fait changer le joueur de zone, le changement s'applique au moment de la résolution (qui est aussi le moment du recap). Comme le recap est un passage obligé avant toute action, le state du joueur reste linéaire et cohérent dans le temps.

Plus généralement, une fois qu'un joueur a recap au-delà du bucket B, son `zone_presence` et son `history` sont alignés sur ce qui s'est passé jusqu'à B. Aucune incohérence à gérer.

### Première détection : on insère pour les deux

Quand A recap, que le seed dit "encounter A-B au bucket 14h", et que B est synced past 14h00 :

- On insère une `event_instance` pending **pour A** avec `encounter_id = X`.
- On insère une `event_instance` pending **pour B** avec le même `encounter_id = X`.
- L'`encounter_id` est calculé déterministiquement (genre `hash(bucket_id, sorted_player_ids)`) pour qu'il soit le même si B re-tire le même encounter de son côté plus tard.

L'unicité `(player_id, type, bucket_id)` garantit qu'on n'insère pas en double : si B recap après A et que son moteur re-tire l'encounter, l'INSERT échouera et on skip silencieusement.

> **Race condition** = situation où le résultat dépend de l'ordre/du timing entre plusieurs opérations parallèles. Ici, sans la contrainte d'unicité, deux INSERT simultanés pour le même bucket pourraient créer des doublons. Avec la contrainte, l'un gagne, l'autre échoue proprement.

### Premier qui clique gagne le choix (first-clicker-wins)

Modèle pour gérer le choix de l'event partagé :

- A et B ont chacun leur `event_instance` pending. Tous deux peuvent voir les boutons.
- **Le premier qui clique gagne le contrôle** :
  - On supprime atomiquement les **deux** `event_instance` du pair (via `encounter_id`).
  - On calcule l'outcome, on applique les effets aux deux joueurs.
  - On append `history` avec le pair et le choix.
- Le second qui clique après : 0 lignes supprimées → on lui affiche "trop tard, l'autre a déjà choisi" + le résumé du résultat.
- Le second qui s'authentifie après résolution : son `event_instance` n'existe plus, le moteur consulte `history` et lui affiche un ambient "à 14h t'as croisé A, voici ce qu'il s'est passé".

### Pourquoi pas attendre que les deux soient d'accord

On aurait pu modéliser "négociation" : A propose un choix, B doit valider, etc. Inconvénient : si B prend 1h pour répondre, A est bloqué 1h sur cet event (pour rappel : 1 stateful en attente max → A ne peut pas avancer son `!recap` ni faire d'action vu la règle "must be synced"). Mauvaise UX.

Le first-clicker-wins coupe court : qui agit, agit. Plus rapide, plus dynamique, et fidèle à un univers de pirates où on attaque sans demander.

### Compatibilité d'event entre deux joueurs

Tous les events cross-player ne s'appliquent pas à toutes les paires. Un combat entre deux pirates est plausible ; une alliance entre Marine et Pirate ne l'est pas. Chaque générateur cross-player déclare sa compatibilité :

```ts
const piratesEncounter: EventGenerator = {
  type: 'combat.pirates_encounter',
  scope: 'stateful',
  appliesTo: (a, b) => a.status === 'PIRATE' && b.status === 'PIRATE',
  probability: (a, b) => 0.3,
  ...
};

const piratesAlliance: EventGenerator = {
  type: 'alliance.pirates',
  scope: 'stateful',
  appliesTo: (a, b) => a.status === 'PIRATE' && b.status === 'PIRATE',
  probability: () => 0.02,    // rare
  ...
};
```

`appliesTo` est l'équivalent du `conditions` mais pour les paires.

### Filtrage par guild

Un encounter cross-player ne se déclenche que **si les deux joueurs sont sur le même serveur Discord**. Si Rayan joue sur le serveur "OnePieceFR" et Hakim sur "PirateLand", ils ne se croisent jamais, même s'ils sont tous les deux dans East Blue.

Le filtre est appliqué automatiquement par l'engine en filtrant `othersInZone` sur la guild du joueur qui recap : avant même de regarder les `appliesTo`, le moteur ne considère que les autres joueurs présents dans la **même guild** que celui qui tape `!recap`.

> **Pourquoi ce filtre** : chaque serveur Discord est sa propre "instance" du jeu pour la communauté qui s'y trouve. Le `!leaderboard` du serveur, les rangs de yonko du serveur, la rivalité locale — tout ça suppose que les interactions sociales restent dans la guild d'origine. Voir le domaine `guild_player` pour comment on track la présence joueur/serveur.

### La règle qui rend tout simple : on ne peut encounter qu'un joueur synced past bucket

Quand le moteur d'A processe le bucket B et veut générer un encounter avec X, il vérifie :

> Est-ce que `X.last_recap_at >= fin du bucket B` ?

- Si oui → X a vécu ce moment dans son timeline → l'encounter est généré et l'`event_instance` est insérée pour A et X.
- Si non → X est en retard sur sa timeline → on **skip** l'encounter pour ce bucket. X n'existe pas dans le monde à ce moment-là, son bateau n'a pas "rattrapé" cet instant.

Traduction game design : **on ne peut croiser que des joueurs qui ont déjà vécu ce moment**. Les joueurs AFK sont invisibles aux encounters tant qu'ils ne se sont pas synchros.

#### Pourquoi cette règle élimine tous les conflits

Le scénario problématique d'avant : Hakim recap à 14h, encounter avec Rayan AFK, Hakim résout un combat. Rayan revient plus tard, recap, sa timeline diverge (mainstory à 13h30 → Drum). Conflit avec le combat à 14h.

Avec la règle "synced past bucket" : Hakim au bucket 14h voit que Rayan a `last_recap_at = 12h` → skip. **Aucun encounter n'est jamais généré pour un joueur AFK.** Aucun conflit possible.

#### Ce que ça implique pour Hakim au bucket 14h

L'encounter Hakim-Rayan à 14h ne se produit jamais si Rayan n'est pas synchro. Quand Rayan revient et recap au-delà de 14h00, son moteur va tirer le seed du bucket 14h pour son propre compte. Si le seed dit "encounter avec Hakim", on re-vérifie : Hakim est-il synchro past bucket 14h00 ? Si oui (très probable car Hakim joue activement), on génère l'encounter pour les deux **à ce moment-là** (= au recap de Rayan).

Donc l'encounter peut quand même se produire — juste plus tard, quand les deux joueurs sont alignés.

#### Encounters en temps réel quand les deux sont synchros

Quand Rayan et Hakim sont actifs et synchros au bucket courant, le premier qui recap (= au prochain bucket complété, donc toutes les 15 min en pratique) déclenche l'encounter check, voit l'autre comme synced, et insère l'`event_instance` pour les deux.

L'autre joueur reçoit un DM (cf section notif) ou voit l'event au prochain `!recap`. Comme la règle "must be synced" force un recap fréquent pour pouvoir agir, l'event est traité dans la foulée.

#### Conséquence : encounters AFK invisibles aux autres

Un joueur AFK n'est pas une cible d'encounter. Si la moitié des joueurs sont AFK, le monde paraît plus "vide" pour les actifs. Trade-off accepté : c'est sain, le monde est peuplé par ceux qui jouent, pas par des fantômes.

Un joueur qui revient et fait son `!recap` redevient visible aux autres dès que son `last_recap_at` rattrape leur fenêtre de recap.

---

## Mainstory : une chaîne d'events à conditions strictes

La mainstory n'est pas un seul gros event "Alabasta" qui s'étire sur des semaines. C'est une **suite d'events distincts**, chacun avec ses conditions, qui se débloquent les uns après les autres.

```ts
{ type: 'mainstory.alabasta.find_map',         conditions: ..., probability: 0.95, oneTime: true }
{ type: 'mainstory.alabasta.save_vivi',        conditions: history.has('mainstory.alabasta.find_map.resolved') && crew.has('vivi'), probability: 0.95, oneTime: true }
{ type: 'mainstory.alabasta.defeat_crocodile', conditions: history.has('mainstory.alabasta.save_vivi.resolved') && hasItem('haki'), probability: 1.0, oneTime: false }
{ type: 'mainstory.alabasta.retry_crocodile',  conditions: lastResolutionOf('mainstory.alabasta.defeat_crocodile') === 'lost', cooldown: 7200, probability: 1.0 }
```

Chaque event lit `history` pour savoir s'il est éligible. La chaîne se forme **implicitement** par les conditions.

### Pourquoi pas une colonne `mainstory_chapter` sur `player`

On aurait pu stocker l'avancement explicitement : `player.mainstory_chapter = 3` → débloque l'event "Alabasta - étape 3".

Inconvénient : forte couplage. Si on rajoute un event "retry" entre deux étapes, on doit décaler la numérotation et migrer les données. Si on veut un branchement (deux mainstory parallèles), il faudrait une seconde colonne. Si on veut "saut conditionnel" (genre tu peux skip Alabasta si tu as fait Drum), il faut une logique en haut.

Avec la chaîne par conditions sur `history`, **tout vit dans les conditions de chaque event**. Ajouter, retirer, brancher → on touche un fichier, sans migration.

### Probabilités élevées

Pour un event mainstory, la `probability` est haute (0.95 ou 1.0) : ça veut dire qu'au prochain bucket éligible (avec conditions remplies), il s'enclenche presque à coup sûr. Le joueur n'attend pas 6 mois en RNG hostile pour avancer dans l'histoire.

---

## La commande `!recap` (cycle complet)

Pas de cooldown : le joueur peut taper `!recap` autant qu'il veut. S'il n'y a rien à afficher, on lui dit qu'il n'y a rien.

Comportement détaillé :

1. **Y a-t-il un `event_instance` pending pour ce joueur ?**
   - Oui → on affiche cet event (embed + boutons s'il y a des choix). On ne traite aucun nouveau bucket.
   - Non → on continue.

2. **On rejoue les buckets entre `last_recap_at` et `now()`** (cap 48h).
   - Pour chaque bucket :
     - On dérive le seed.
     - On itère les générateurs ambient → ceux qui passent leurs filtres et leur proba sont matérialisés (embed + effets appliqués).
     - On itère les générateurs stateful → si plusieurs candidats, tirage pondéré, on en garde un.
   - Si un stateful a été tiré : on insère l'`event_instance`, on stoppe la boucle, on fige `last_recap_at` au début de ce bucket.
   - Sinon, on continue jusqu'au dernier bucket. À la fin, `last_recap_at = now()`.

3. **On affiche** :
   - Liste chronologique des events ambient (si plusieurs).
   - Puis l'event stateful en attente (si présent), avec ses boutons.

4. **Tout ça dans une seule transaction** : si l'INSERT de l'`event_instance` foire, les effets ambient ne sont pas appliqués non plus.

---

## Notification DM

Quand un `event_instance` est créé pour un joueur **qui n'est pas en train de faire `!recap`**, on lui envoie un DM Discord pour le prévenir.

Cas typique : encounter cross-player → A recap, on insère pour A et B, A est notifié dans la conversation actuelle, B reçoit un DM.

> **DM** = "Direct Message", message privé Discord du bot vers l'utilisateur.

Best-effort : si le joueur a désactivé les DM du bot, l'API Discord renvoie une erreur. On l'ignore. Le joueur verra son event au prochain `!recap` manuel — pas perdu.

---

## Le contexte `ctx`

Toutes les fonctions des générateurs reçoivent un `ctx` qui contient l'état du jeu visible par le générateur :

- `ctx.player` — la ligne `player` actuelle
- `ctx.crew` — les personnages embarqués avec helpers (`has(name)`, `getByName(name)`)
- `ctx.ship` — le navire et ses modules
- `ctx.inventory` — les ressources possédées
- `ctx.history` — helpers pour lire la table `history` :
  - `history.has(eventType)` → `true` si le joueur a déjà ce type dans son passé
  - `history.lastResolutionOf(eventType)` → le `resolutionType` de la dernière résolution (ex: `'mainstory.alabasta.defeat_crocodile.lost'`)
  - `history.countSince(eventType, durationSec)` → combien de fois ce type est apparu dans les N dernières secondes
- `ctx.bucket_id` — le bucket en cours de traitement
- `ctx.zone` — la zone du joueur à ce bucket (lue depuis history)
- `ctx.othersInZone` — les autres joueurs présents dans la même zone à ce bucket (pour cross-player)

### Pourquoi un seul objet `ctx` plutôt que plusieurs paramètres

Pour pouvoir étendre le contexte sans casser tous les générateurs existants. Si on rajoute demain `ctx.weather`, aucun fichier de générateur ne change tant qu'il n'utilise pas la météo. Avec des paramètres positionnels, on aurait dû patcher chaque générateur.

---

## Effets

Les effets sont les conséquences mécaniques d'un event. On les modélise comme un type discriminé pour qu'on puisse les appliquer de manière générique.

> **Type discriminé** = un type union TypeScript où chaque variante est distinguée par une propriété commune (ici `type`). Permet à TS de savoir, dans un `switch(effect.type)`, exactement quels champs sont disponibles.

```ts
type Effect =
  | { type: 'addBerries';   amount: bigint }
  | { type: 'spendBerries'; amount: bigint }
  | { type: 'addBounty';    amount: bigint }
  | { type: 'addItem';      item: string }
  | { type: 'addStatus';    status: 'wounded' | 'sick' | ... }
  | { type: 'addMorale';    amount: number }
  | ...;
```

L'engine a une fonction `applyEffects(effects, ctx, transaction)` qui les applique en bloc. Chaque effet a son handler côté engine.

### Pourquoi pas appliquer les effets directement dans `resolve`

On aurait pu faire `resolve: (ctx, rng) => { ctx.player.berries += 50; ... }` et muter directement.

Inconvénients :

- Le générateur doit savoir parler à la DB → couplage avec Drizzle, transactions, etc.
- Le code est dispersé : pour comprendre tous les effets sur les berries, il faut lire tous les générateurs.
- Difficile à tester sans monter une DB.

Avec les Effects en data : le générateur déclare ce qu'il veut, l'engine applique. Pure logique métier d'un côté, persistance de l'autre.

---

## Couplage avec `history`

À chaque résolution d'event, une entrée part dans `history` avec :

- `event_type` = le `resolutionType` retourné par le générateur (ex: `mainstory.alabasta.defeat_crocodile.won`)
- `actor_player_id` = le joueur qui a déclenché l'event (ou `NULL` pour les events système)
- `target_type` + `target_id` = optionnel, sur quoi porte l'event
- `bucket_id` = le bucket dans lequel l'event a été généré (pour idempotence, cf section optimisations)
- `payload` = les données utiles pour les futurs lookups (montant gagné, choix fait, qui a perdu, etc.)

C'est cette table qui rend possible :

- les `conditions` qui regardent le passé,
- les `cooldown` (lookup des derniers événements),
- les `oneTime` (lookup "ai-je déjà fait ça"),
- la mainstory qui se déroule,
- les events qui réagissent à des actions passées (refus répétés d'une île → nausée).

---

## Catalogue minimal pour démarrer

Pour valider l'architecture, on commencera avec quelques générateurs simples :

- `ambient.seagull_flyby` — purement décoratif
- `ambient.calm_sea` / `ambient.rough_sea` — pour avoir du remplissage
- `fishing.barrel_found` — premier stateful simple, à un seul step
- `combat.pirates_encounter` — premier cross-player

Au fil du temps, on enrichira le catalogue. Pas la peine d'écrire 50 générateurs avant d'avoir un moteur qui tourne.

---

## Organisation des fichiers

```
apps/bot/src/domains/event/
  index.ts                                  ← exports publics
  engine/                                   ← le moteur de recap
    process-recap.ts                        ← orchestration globale
    bucket.ts                               ← calcul des buckets
    rng.ts                                  ← RNG seedé
    apply-effects.ts                        ← application des Effect[]
  registry.ts                               ← liste de tous les générateurs
  generators/
    ambient/
      seagull-flyby.ts
      calm-sea.ts
    fishing/
      barrel-found.ts
    combat/
      pirates-encounter.ts
    mainstory/
      alabasta/
        find-map.ts
        save-vivi.ts
        defeat-crocodile.ts
        retry-crocodile.ts
  types.ts                                  ← le contrat EventGenerator
  repository.ts                             ← lecture/écriture event_instance
```

Chaque générateur est un fichier qui exporte un `EventGenerator`. Le `registry.ts` collecte tout :

```ts
export const allGenerators: EventGenerator[] = [
  seagullFlyby,
  calmSea,
  barrelFound,
  piratesEncounter,
  ...
];
```

Le moteur itère cette liste à chaque bucket.

### Pourquoi un registry centralisé et pas un autoload depuis le filesystem

L'autoload (genre "lis tous les fichiers du dossier `generators/`") marche, mais :

- Plus difficile à tester (les imports sont dynamiques),
- Plus difficile de désactiver temporairement un générateur (faut renommer le fichier),
- Moins explicite pour qui lit le code (pas de point d'entrée clair).

Avec un registry explicite, on voit immédiatement la liste de tous les events actifs.

---

## Ajouter un nouvel event

Étapes pour un dev qui veut ajouter un event :

1. Créer un fichier dans `generators/<famille>/<nom>.ts`.
2. Exporter un `EventGenerator` qui respecte le contrat (voir `types.ts`).
3. L'ajouter dans `registry.ts`.
4. Si nouveau type d'effet : étendre l'union `Effect` et ajouter le handler dans `apply-effects.ts`.
5. Si nouveau type de log dans `history` (ex: nouveau `resolutionType`) : déclarer le payload dans `apps/bot/src/domains/history/types/event.ts` (cf doc `history.md`).

C'est tout. Pas de migration, pas de table à toucher, pas de modif de schéma — sauf si on veut un nouveau type d'effet inédit.

---

## Optimisations & correctness

Quelques décisions d'ingénierie importantes pour que le moteur tienne la route dès le début. À implémenter dès la première version, pas en YAGNI — sinon on se retrouve à les ajouter en urgence quand un truc casse.

### 1. Pré-agréger `history` en mémoire au début du recap

À chaque bucket, plusieurs générateurs vont appeler `ctx.history.has(...)`, `lastResolutionOf(...)`, etc. Si chaque appel fait une requête DB, on explose : 50 générateurs × 192 buckets × 2-3 lookups = ~30 000 requêtes pour un seul recap.

**Fix** : au tout début de `process-recap`, on charge **toute** l'history pertinente du joueur en une seule requête :

```ts
const playerHistory = await client
  .select()
  .from(history)
  .where(and(eq(history.actorPlayerId, playerId), gte(history.occurredAt, since)));
```

Puis on construit `ctx.history` qui interroge ce tableau en mémoire :

```ts
ctx.history = {
  has: (type) => playerHistory.some((e) => e.eventType === type),
  lastResolutionOf: (prefix) => playerHistory.filter((e) => e.eventType.startsWith(prefix)).at(-1)?.eventType,
  countSince: (type, sec) => playerHistory.filter((e) => e.eventType === type && e.occurredAt > Date.now() - sec * 1000).length,
};
```

Une seule requête DB pour tout le recap. Tous les générateurs lisent en mémoire. Massif comme gain.

> **Note** : pour les events `oneTime` qui doivent matcher "depuis toujours", on peut soit charger toute l'history du joueur (cher si un joueur a 100k events), soit faire une requête séparée et ciblée pour ces events-là. À voir au moment de l'implém.

### 2. Idempotence des effets ambient via `bucket_id` dans `history`

Si la transaction du recap échoue à mi-parcours et qu'on retry, les effets ambient peuvent être appliqués deux fois — la transaction Postgres protège contre la double application **dans la même transaction**, mais pas contre un retry après échec.

**Fix** : ajouter une colonne `bucket_id bigint` (nullable) à la table `history`, et avant d'insérer un event ambient, vérifier qu'il n'existe pas déjà pour ce `(player_id, event_type, bucket_id)`. Couvert par un index unique partiel :

```sql
CREATE UNIQUE INDEX history_idempotence_idx
  ON history (actor_player_id, event_type, bucket_id)
  WHERE bucket_id IS NOT NULL;
```

Si le recap retry, l'INSERT fail → on skip silencieusement → pas de double-spend.

> **Pourquoi pas pour les events stateful** : la table `event_instance` a déjà sa propre contrainte d'unicité `(player_id, type, bucket_id)`. Ce sont les ambient qu'il faut couvrir parce qu'eux ne passent pas par `event_instance`.

### 3. Index `history` pour le hot path

Les filtres `cooldown` et `oneTime` font `WHERE actor_player_id = ? AND event_type = ?`. L'index existant `(actor_player_id, occurred_at desc)` aide pour le tri mais pas pour le filtre sur `event_type`.

Si on a fait l'optim 1 (pré-agrégation), c'est moins critique parce qu'on charge tout d'un coup. Mais pour les requêtes ad-hoc (debug, analytics), on ajoute :

```sql
CREATE INDEX history_actor_event_type_idx
  ON history (actor_player_id, event_type, occurred_at DESC);
```

### 4. Custom_id Discord compact

Discord cape les `custom_id` à **100 caractères**. Avec des noms type `mainstory.alabasta.defeat_crocodile` (37 chars) + métadonnées (`:step:opener:choice:haki`) on flirte avec la limite, et pour des events plus profonds (`mainstory.skypiea.zone_2.altar.choice_2`) ça dépasse.

**Fix** : on stocke l'`event_instance.id` (entier) dans le custom_id + le `choice_id` court :

```
custom_id = "evt:1234:open"
```

C'est l'`event_instance` (en DB) qui porte la réf au type et à l'étape, pas le custom_id. Au handler, on parse `1234` et `open`, on charge la ligne `event_instance`, on dispatch.

Avantages :

- Limite de 100 chars largement respectée même pour les events très profonds.
- Un id changeant rend impossible de "rejouer" un vieux bouton après suppression de l'event_instance (le handler retourne "trop tard, l'autre a déjà choisi").

### 5. Validation des `goTo` au démarrage

Si on tape `goTo: 'haki_charegd'` (typo), l'erreur n'apparaît qu'au runtime, sur le bucket d'un joueur précis qui clique. Cool en prod.

**Fix** : au démarrage du bot, parser tous les générateurs et vérifier que tous les `goTo` pointent vers des steps qui existent. Throw au boot, pas en prod runtime.

```ts
function validateGenerators(generators: EventGenerator[]) {
  for (const gen of generators) {
    if (gen.scope !== 'stateful') continue;
    const stepNames = Object.keys(gen.steps);
    for (const [stepName, step] of Object.entries(gen.steps)) {
      for (const choice of step.choices(/* ctx fake */)) {
        if (choice.goTo && !stepNames.includes(choice.goTo)) {
          throw new Error(
            `Generator ${gen.type}, step ${stepName}, choice ${choice.id}: ` + `goTo '${choice.goTo}' n'existe pas dans steps`,
          );
        }
      }
    }
  }
}
```

Cheap à coder, énorme en peace of mind. À appeler au boot du bot, après le chargement du registry.

> **Limite** : `choices` étant une fonction qui prend `ctx`, on ne peut pas valider les choix conditionnels (qui dépendent du `ctx`). On valide juste les choix de base, ce qui couvre 90% des typos. Pour les autres, un test snapshot par générateur (futur) couvrira le reste.

### 6. Cap sur la fenêtre du recap (déjà décidé : 48h)

Rappel : on rejoue au max 48h de buckets, peu importe combien de temps le joueur a été AFK. Évite l'explosion de calcul, et c'est un game design clair ("tu vois les events des dernières 48h").

---

## Résumé des grandes idées

- **Tout est lazy** : pas de cron, calcul au `!recap`. Coût d'infra zéro hors usage.
- **Règle fondatrice : tu dois être synchro pour agir.** Toute commande qui modifie le monde nécessite que `last_recap_at` soit à jour et qu'aucun stateful ne soit en attente. Sinon, le bot redirige vers `!recap`.
- **Buckets de 15 min + seed déterministe** : les rencontres entre joueurs s'auto-synchronisent sans communication. Pas de table partagée à écrire.
- **Ambient = jeté à la volée. Stateful = persisté en `event_instance`.** Deux modèles parce que les besoins sont différents.
- **1 stateful en attente max par joueur** : narration linéaire, pas de menu de quêtes.
- **Cross-player en first-clicker-wins** : pas d'attente entre joueurs, pas de blocage.
- **Cross-player filtré par guild** : les rencontres restent dans le serveur Discord d'origine.
- **Encounter possible uniquement entre joueurs synced past le bucket** : un joueur AFK est invisible aux autres tant qu'il n'a pas rattrapé sa timeline. Plus aucune incohérence temporelle.
- **Conditions, cooldown, oneTime → tous lus depuis `history`.** Pas de table en plus, pas de compteurs ad hoc.
- **`zone_presence` séparé de `history`** : projection dénormalisée pour les requêtes "qui était dans Z à T".
- **Multi-étapes via graphe d'étapes nommées** : déclaratif, lisible, scalable.
- **Mainstory = chaîne d'events à conditions strictes**. Pas de pointeur "next step" stocké.
- **Effets en data**, appliqués par l'engine. Le générateur reste pure logique.
- **DM best-effort** quand un event est créé pour un joueur AFK.
- **Cap 48h** pour les retours après AFK long.
- **Pré-agrégation de `history` en mémoire** au début du recap : une requête, tout le reste lu en RAM.
- **Idempotence ambient via `bucket_id` dans `history`** + unique index : retry safe.
- **`custom_id` Discord compact** : `evt:<id>:<choice>` plutôt que le type long.
- **Validation des `goTo` au boot** : on évite les typos qui pètent en prod.
