# Domaine : event

## Concept

Un **event** = quelque chose qui arrive au joueur dans le monde du jeu : pêche d'un baril, rencontre avec un autre pirate, combat contre Crocodile, vague qui secoue le navire. Le joueur les découvre via `!recap`.

Un event n'est **jamais déclenché à la demande**. Il est calculé en fonction du temps écoulé, de la zone du joueur et de son passé. Le moteur reconstitue ce qui aurait pu se produire pendant que le joueur était AFK.

---

## Architecture

### 1. Tout est lazy (calculé au `!recap`)

Deux écoles possibles pour un monde persistant :

| École                  | Principe                                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cron tick**          | Un script en background s'exécute toutes les N min, génère les events au fil du temps pour tous les joueurs. `!recap` sert le pré-calculé.            |
| **Lazy** (notre choix) | Aucun job en background. Tant que personne ne joue, le bot dort. `!recap` calcule à la volée tout ce qui aurait pu arriver depuis la dernière visite. |

> **Cron** = programme qui s'exécute automatiquement à intervalle régulier. **Tick** = un cycle d'horloge du moteur. **Lazy** = "paresseux", calcul fait uniquement au moment où on en a besoin.

**Pourquoi lazy :**

- **Coût d'infra zéro** quand personne ne joue (90% des joueurs Discord sont inactifs à un instant T).
- **Simplicité de déploiement.** Pas de scheduler, pas de gestion "que se passe-t-il si le bot redémarre pendant un tick ?".
- **Local dev trivial.** Pas de cron parasite, le bot tourne dans un terminal et reste cohérent.
- **Failure mode propre.** Avec un cron, si le bot est down 4h, on a "manqué" 4h de ticks → besoin de catch-up. En lazy, `!recap` recompute toujours depuis `last_recap_at`, peu importe les downtimes.

**Trade-offs acceptés :** perte du sentiment "le monde tourne quand je regarde pas" (compensé par le seed déterministe, voir plus bas) ; events à péremption stricte (vente flash de 30 min) moins naturels — pas un besoin pour ce jeu.

### 2. Buckets de 15 min

Le temps est découpé en tranches fixes de 15 min — on ne peut pas dire "à 14h32:17.453 il s'est passé X" (trop fin, infini de moments).

> **Bucket** = "seau" en anglais. Tranche de temps de durée fixe. Tout ce qui arrive dans la tranche va dans le même seau.

```
12h00 ─── bucket A ─── 12h15 ─── bucket B ─── 12h30 ─── bucket C ─── 12h45 ...
```

**Identification d'un bucket :**

```
bucket_id = floor(epoch_seconds / 900)
```

- `epoch_seconds` = secondes depuis le 1er janvier 1970 (`Date.now() / 1000`).
- `floor(...)` = arrondi entier inférieur.
- `900` = 15 × 60 sec.

Ex: 30 avril 2026 14h00 UTC → `floor(1809184000 / 900) = 2010204`. Un entier stockable, comparable, indexable, sans souci de fuseau horaire.

**Pourquoi 15 min :**

| Levier                | Effet                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Coût recap            | Cap de 48h → 5 min = 576 buckets, 15 min = 192, 1h = 48. À 192 c'est gérable.                                                              |
| Densité de rencontres | Deux joueurs partagent un bucket s'ils sont en zone commune sur la même tranche. Trop court tue les rencontres, trop long les rend floues. |
| Granularité ressentie | "À 14h00 t'as croisé Hakim" représente 15 min : lisible mais précis. À 1h ça serait "ce matin" (flou).                                     |

15 min est le compromis. **Tunable** (juste une constante).

**Sans buckets**, deux options seulement, toutes deux pires :

- Stocker un timestamp précis par joueur et générer à la seconde → deux joueurs dans la même zone ne pourraient jamais se croiser (timelines décalées).
- Pré-calculer un timeline global au tick (= retour à l'école cron).

Le bucket réconcilie "calcul lazy" et "monde partagé".

### 3. Seed déterministe

Pour chaque (bucket, zone), on calcule un seed :

```
seed = hash(bucket_id, zone_id)
```

> **Seed** = "graine" pour un générateur pseudo-aléatoire. Même seed = même séquence de nombres. Comme Minecraft : même seed = même monde généré.
> **Hash** = fonction qui transforme une entrée en nombre. Même entrée → même sortie.

Ce seed initialise le `rng` qui décide :

- Un baril apparaît-il à ce bucket dans cette zone ?
- Deux joueurs présents se rencontrent-ils ?
- Combien de berries dans le baril ?

**Le truc magique :** deux joueurs qui calculent le seed du bucket 14h zone "East Blue" obtiennent **exactement le même seed**. Donc si Rayan recap à 18h et tire "rencontre avec Hakim au bucket 14h", quand Hakim recap à 19h, son moteur tire le même seed → la même rencontre. Pas besoin que l'un écrive pour l'autre, **le hasard est partagé**.

**Alternatives écartées :**

| Alternative                                            | Problème                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Random non-seedé                                       | Rayan voit "rencontre Hakim" à 14h, Hakim ne le verra jamais. Désynchronisé. |
| Table `encounter` partagée écrite par le 1er qui recap | Couplage, race conditions, complexité.                                       |
| Cron tick                                              | Marche, mais on a vu pourquoi on n'en veut pas.                              |

---

## Règle fondatrice : synchro pour agir

**Toute action qui modifie le monde (pêcher, recruter, naviguer, combattre, acheter) nécessite que le joueur soit à jour dans son `!recap`.**

Conditions à remplir :

1. `last_recap_at` est égal à la fin du dernier bucket complet (= il a vécu tous ses events passés).
2. Pas d'`event_instance` pending (= pas de stateful en attente d'un choix).

Sinon le bot répond :

> "Tu as des events en attente. Tape `!recap` pour les vivre avant d'agir."

### Pourquoi cette règle change tout

Sans elle : un joueur AFK peut subir une attaque à 14h dans le timeline du monde, mais s'il tape `!pêcher` à 23h sans recap, son équipage est encore "frais" et il agit comme si rien n'avait eu lieu. Le bot devrait retconner, ré-appliquer les conséquences, etc. Compliqué et incohérent.

Avec : **le joueur traverse son passé avant d'altérer le présent**. Quand il tape `!pêcher` à 23h, il a forcément vécu son `!recap` qui a appliqué tous les events depuis 12h. Son state est synchro avec le monde.

**Conséquences en cascade :**

- Plus aucune incohérence temporelle. Un joueur synchro est synchro, point.
- `!recap` devient un passage obligé.
- Pas besoin de `target_effects` dans `history` pour les events cross-player. Quand un encounter a lieu, les deux joueurs sont synchros par construction → INSERT direct pour les deux.
- Pas de fast-forward d'autres joueurs : si A regarde l'état de B, B est forcément à jour avec son `last_recap_at`.

### UX au retour d'AFK

Le joueur revient après 6h d'absence, tape `!naviguer`. Le bot répond :

> "Tu as 24 events en attente, dont une attaque de Hakim. Tape `!recap` pour les vivre."

Il `!recap`, traverse son timeline (ambient affichés, stateful résolus un par un), arrive au présent, et **alors seulement** peut naviguer. Il **rentre dans le monde** au lieu d'agir comme s'il ne l'avait jamais quitté.

### Implémentation : middleware

Au routeur Discord, middleware appliqué aux commandes "actives" (toutes sauf `!recap`, `!profil`, `!aide`) :

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

`isPlayerCaughtUp` vérifie les deux conditions (`last_recap_at` à jour + pas d'`event_instance` pending).

---

## Cycle d'un `!recap`

Le joueur a `last_recap_at` sur sa ligne `player` = jusqu'où on a déjà traité ses buckets.

> Pas exactement "dernière fois qu'on a recap" : c'est "jusqu'à quel point dans le temps on a calculé ses events". Peut reculer si un stateful nous fige.

À `!recap` à 18h00 avec `last_recap_at = 12h00` :

1. **Y a-t-il un `event_instance` pending ?**
   - Oui → on l'affiche (embed + boutons). Aucun nouveau bucket traité.
   - Non → continuer.
2. **Rejouer les buckets entre `last_recap_at` et `now()`** (cap 48h). Pour chaque bucket :
   - Dériver le seed.
   - Itérer les générateurs **ambient** : ceux qui passent filtres + proba sont matérialisés (embed + effets appliqués).
   - Itérer les générateurs **stateful** : si plusieurs candidats, tirage pondéré, on en garde un.
   - Si un stateful est tiré : insérer l'`event_instance`, **stopper la boucle**, figer `last_recap_at` au début de ce bucket.
   - Sinon, continuer jusqu'au dernier bucket. À la fin, `last_recap_at = now()`.
3. **Afficher** : liste chronologique des ambient, puis le stateful en attente avec ses boutons.
4. **Tout dans une seule transaction Drizzle.**

> **Transaction** = bloc de modifs DB soit toutes appliquées, soit toutes annulées. Si l'INSERT de l'`event_instance` foire après application d'un effet ambient (+50 berries), le joueur ne garde pas les berries sans la trace.

Pas de cooldown sur `!recap`. Si rien à afficher, on le dit.

### Cap : on remonte au max 48h

Si retour après 5 jours d'AFK, on cap à 48h avant `now()`. Le reste est perdu.

**Pourquoi un cap :** performance (5 jours × 96 buckets/jour = 480 buckets), game design (`!recap` raconte le récent, pas le mois de vacances), évite la complexité de "compresser" 5 jours en quelques events. **48h est arbitraire, ajustable.**

---

## Les deux types d'events

### 1. Ambient (passifs, jamais persistés)

Petits events décoratifs ou à effet immédiat. Pas de choix.

> _"À 14h15, une vague a secoué ton navire. Ton équipage perd 2 de moral."_
> _"À 14h30, ton équipage a aperçu une mouette."_

Calculés à la volée, affichés dans le recap, effets appliqués dans la transaction. Une fois le recap fini, **plus de ligne en base** — juste une trace dans `history`.

### 2. Stateful (interactifs, persistés)

Demandent une décision ou s'étalent dans le temps.

> _"À 14h45, tu as repéré un baril. [Ouvrir] [Laisser]"_
> _"À 15h00, Crocodile se dresse devant toi. [Attaquer] [Charger Haki]"_

**Persistés** dans `event_instance`. Tant que pas de clic, l'event reste en attente.

> **Stateful** = "qui porte un état". Vit, est créé, attend, est mis à jour à chaque clic, finit résolu et disparaît. Ambient = stateless.

**Pourquoi cette séparation :**

- Les ambient sont nombreux (1+ par bucket facilement) et n'ont aucun besoin de mémoire — leur seule trace utile est `history`.
- Les stateful sont rares (1 max par joueur à un instant T) mais doivent survivre entre recaps puisque le joueur prend du temps pour décider.

Persister les ambient gonflerait `event_instance` pour rien. Ne pas persister les stateful obligerait à les recalculer à chaque recap, ce qui pose problème : si l'aléatoire intervient à la résolution (tirage des dégâts), un re-tirage à chaque vue permettrait au joueur de "rerouler" en double-cliquant.

---

## Table `event_instance`

| Colonne        | Type         | Rôle                                                          |
| -------------- | ------------ | ------------------------------------------------------------- |
| `id`           | bigserial PK | identifiant unique                                            |
| `player_id`    | integer FK   | propriétaire de l'event                                       |
| `type`         | text         | identifiant du générateur (ex: `mainstory.alabasta.find_map`) |
| `bucket_id`    | bigint       | bucket dans lequel l'event a été tiré                         |
| `encounter_id` | bigint, null | relie les events cross-player (deux lignes liées)             |
| `state`        | jsonb        | étape actuelle si event multi-étapes                          |
| `created_at`   | timestamptz  | création de la ligne                                          |

> **`bigserial`** = compteur entier auto-incrémenté en bigint (64 bits). **PK** = primary key. **FK** = foreign key (Postgres garantit la référence). **`jsonb`** = JSON binaire interrogeable et indexable, idéal pour des payloads de forme variable.

**Contrainte unique : `(player_id, type, bucket_id)`** → impossible de créer deux fois le même event pour le même joueur sur le même bucket. C'est l'**idempotence**.

> **Idempotence** = opération qu'on peut appeler N fois avec le même résultat qu'une seule. "Marquer comme lu" : idempotent. "Envoyer email" : non.

Crucial ici : si le joueur tape `!recap` deux fois, le moteur veut générer le même event depuis le même seed. La contrainte refuse le doublon → skip → pas de duplicata.

### Une fois résolu : DELETE

`event_instance` ne contient que ce qui est en cours. Une fois résolu, la ligne est supprimée et la trace part dans `history`.

> **Append-only** = on n'ajoute que des lignes, jamais d'UPDATE/DELETE. C'est `history`. `event_instance` n'est PAS append-only : on UPDATE le `state` à chaque transition, DELETE à la résolution. C'est un "panier en cours", pas un log.

**Pourquoi pas un champ `status: 'resolved'` ?** La table grossirait indéfiniment alors qu'on n'a aucun usage des resolved (info utile dans `history`). Supprimer = plus propre, plus économe en index.

### Règle d'or : un seul stateful en attente à la fois par joueur

Pendant le rejeu :

- Dès qu'un bucket génère un stateful, on l'insère et **on s'arrête**.
- `last_recap_at` figé au début de ce bucket.
- Tant que le stateful n'est pas résolu, `!recap` ne fait que ré-afficher l'event en attente.
- Une fois résolu, `!recap` reprend là où il s'était arrêté.

**Pourquoi :** rythme narratif (tu vois → tu décides → tu continues), plutôt que 8 décisions balancées d'un coup.

**Alternatives écartées :**

- _Plusieurs stateful en parallèle_ : possible, mais menu de quêtes, plus dur à modéliser, casse la narration linéaire de la mainstory.
- _Tout résolu en un clic au recap_ : perd "tu décides et tu vis avec". Et certains events doivent rester ouverts (combat de mainstory laissé en suspens pour s'équiper).

**Si plusieurs générateurs candidatent sur un même bucket :** un bucket peut générer plein d'ambient mais **au plus un seul stateful**. Si plusieurs stateful candidatent (ex: combat ET pêche d'un kraken), on en pick un seul (tirage pondéré par leur `weight`). Les autres skippés pour ce bucket. Rationale : le `bucket_id` reste un identifiant fiable du contexte ; sinon il faudrait jouer en série (ordre ?) ou en simultané (joueur arbitre deux choix).

---

## Le générateur d'event

Objet qui définit quand et comment un event apparaît. **Un fichier par générateur**.

### Forme ambient

```ts
const seagullFlyby: EventGenerator = {
  type: 'ambient.seagull_flyby',
  scope: 'ambient',

  conditions: (ctx) => ctx.zone === 'east_blue', // optionnel
  cooldown: 1800, // optionnel : 30 min, lookup history
  probability: () => 0.3, // 30% / bucket éligible

  build: (ctx, rng) => ({
    embed: makeEmbed('Une mouette passe au-dessus du navire.'),
    effects: [], // ou [{ type: 'addMorale', amount: 1 }]
  }),
};
```

### Forme stateful simple (1 étape)

```ts
const barrelFound: EventGenerator = {
  type: 'fishing.barrel_found',
  scope: 'stateful',
  probability: () => 0.1,

  initial: 'choice', // étape de départ
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

À retenir :

- `build` pour les ambient (1 écran, pas d'interaction).
- `steps` pour les stateful. Chaque étape : nom + embed + choix.
- Chaque **choix** a soit `goTo` (transition) soit `resolve` (résolution finale).
- À la résolution : retour de `embed` (résultat narratif), `effects` (conséquences mécaniques), `resolutionType` (ID qui partira dans `history`).

### Forme stateful multi-étapes avec branches

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

Tu peux faire 3 étapes, 8 étapes, des étapes qui se rejoignent ou cycliques. Le `state` jsonb stocke juste le nom de l'étape courante : `{ step: 'haki_charged' }`.

### Pourquoi un graphe d'étapes nommées et pas un gros switch

Le pattern alternatif :

```ts
step: (choiceId, state, ctx, rng) => {
  if (state.step === 'opener' && choiceId === 'haki') return ...;
  if (state.step === 'opener' && choiceId === 'attack') return ...;
  if (state.step === 'haki_charged' && choiceId === 'strike') return ...;
  // 8 étapes → switch géant
}
```

Pour 1-2 étapes c'est OK, mais ça devient une soupe de `if` dès que ça grossit. Avec le graphe :

- chaque étape nommée explicitement,
- chaque choix dit clairement ce qu'il fait (`goTo` ou `resolve`),
- la dispatch `state.step → handler` est faite **par l'engine**,
- réutilisation facile (`fightLow` / `fightHigh`).

Ouvre le fichier, tu vois le graphe.

### Logique conditionnelle dans les étapes

`embed`, `choices`, `resolve` sont des fonctions qui reçoivent `ctx`. Adaptation à l'état du joueur en temps réel.

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

**On filtre les choix non-éligibles plutôt que de les griser** : moins de bruit visuel pour le joueur. Cohérent avec le reste du bot (cf `set-captain.ts`).

---

## Filtres au niveau du générateur

Avant qu'un générateur soit considéré pour un bucket :

| Filtre             | Type                        | Effet                                                                                                                                   |
| ------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `conditions`       | dur, basé sur l'état du jeu | renvoie `false` → skip. Aucune proba ne rattrape. Ex: zone X requise, perso requis.                                                     |
| `cooldown: 86400`  | anti-spam (24h)             | lookup `history` "ce joueur a-t-il déclenché un event de type X dans les 24 dernières heures ?" — oui → skip.                           |
| `oneTime: true`    | une seule fois dans la vie  | lookup `history` "déjà déclenché ne serait-ce qu'une fois ?" — oui → skip. Pratique pour la mainstory (on ne sauve pas Vivi deux fois). |
| `probability(ctx)` | tirage final, ∈ [0,1]       | comparé à `rng.next()` ; échec → skip.                                                                                                  |

**Pourquoi tous ces filtres lisent `history` :** c'est le rôle de `history` (cf doc dédiée). Tout est archivé. Au lieu d'ajouter une colonne par compteur sur `player` (`barrel_count_24h`, `kraken_count_lifetime`, ...), on a une seule table de logs et chaque générateur lit ce qu'il veut. **Avantage immense :** ajouter un nouveau filtre ne demande aucune migration.

---

## Cross-player : rencontre entre deux joueurs

Quand deux joueurs sont dans la même zone et que le seed dit "rencontre", on matérialise l'event **pour les deux**.

### Comment savoir qui était dans quelle zone à un bucket donné

Pour vérifier "qui était dans Z à T", il faut l'historique des zones de **tous les joueurs**, pas juste celui qui recap.

Table dédiée **`zone_presence`** :

| Colonne      | Type        | Rôle                             |
| ------------ | ----------- | -------------------------------- |
| `player_id`  | integer FK  |                                  |
| `zone`       | enum        | zone occupée                     |
| `entered_at` | timestamptz | entrée dans la zone              |
| `left_at`    | timestamptz | sortie — `NULL` si zone actuelle |

PK : `(player_id, entered_at)`.
Index principal : `(zone, entered_at, left_at)` pour "qui était dans Z à T".

C'est un historique des zones structuré comme des **intervalles** (entrée → sortie) plutôt que des événements ponctuels.

#### Pourquoi pas se contenter de `history`

On pourrait dériver l'info de `history.player.zone_changed`, mais la requête "qui était dans Z à T" devient :

> "Pour tous les joueurs, trouver leur dernier `player.zone_changed` avant T, filtrer ceux dont `toZone` = Z."

Window function lourde, mal couverte par un index simple. À 1000 joueurs, ça crame.

Avec `zone_presence`, simple range query indexable :

```sql
SELECT player_id FROM zone_presence
WHERE zone = 'east_blue'
  AND entered_at <= '14:00'
  AND (left_at IS NULL OR left_at > '14:00')
```

> **Projection dénormalisée** = copie d'une info déjà stockée ailleurs, structurée différemment pour optimiser un cas de lecture précis. Pattern courant en DB.

#### Maintenance des deux sources

À chaque changement de zone, dans la même transaction Drizzle :

1. UPDATE la ligne courante de `zone_presence` : `left_at = <timestamp du bucket>`.
2. INSERT une nouvelle ligne : `entered_at = <timestamp du bucket>, left_at = NULL`.
3. Append à `history` un `player.zone_changed`.

Tout dans la même transaction → toujours synchronisées, pas de drift.

### Cohérence temporelle automatique

Comme **aucun joueur ne peut agir sans être synchro**, deux joueurs qui s'encountent sont forcément à jour dans leur timeline. Pas de retcon, pas de divergence entre `zone_presence` et `history`.

Une fois qu'un joueur a recap au-delà du bucket B, ses `zone_presence` et `history` sont alignés sur ce qui s'est passé jusqu'à B. Aucune incohérence à gérer.

### Première détection : INSERT pour les deux

Quand A recap, que le seed dit "encounter A-B au bucket 14h", et que B est synced past 14h00 :

- INSERT `event_instance` pending **pour A** avec `encounter_id = X`.
- INSERT `event_instance` pending **pour B** avec le même `encounter_id = X`.
- L'`encounter_id` est calculé déterministiquement (`hash(bucket_id, sorted_player_ids)`) → identique si B re-tire le même encounter plus tard.

L'unicité `(player_id, type, bucket_id)` garantit pas de doublon : si B recap après A et re-tire l'encounter, l'INSERT échoue silencieusement.

> **Race condition** = situation où le résultat dépend de l'ordre/timing entre opérations parallèles. Sans la contrainte d'unicité, deux INSERT simultanés pourraient créer des doublons. Avec, l'un gagne, l'autre échoue proprement.

### First-clicker-wins

Modèle pour gérer le choix :

- A et B ont chacun leur `event_instance` pending. Tous deux peuvent voir les boutons.
- **Le premier qui clique gagne le contrôle :**
  - Suppression atomique des **deux** `event_instance` du pair (via `encounter_id`).
  - Calcul de l'outcome, application des effets aux deux.
  - Append `history` avec le pair et le choix.
- Le second qui clique après : 0 lignes supprimées → on lui affiche "trop tard, l'autre a déjà choisi" + résumé.
- Le second qui se connecte après résolution : son `event_instance` n'existe plus, le moteur consulte `history` et lui affiche un ambient "à 14h t'as croisé A, voici ce qu'il s'est passé".

**Pourquoi pas une négociation entre les deux :** si B prend 1h à répondre, A est bloqué 1h sur cet event (1 stateful max + règle "must be synced" → A ne peut pas avancer). Mauvaise UX. First-clicker-wins coupe court : qui agit, agit. Plus rapide, plus dynamique, fidèle aux pirates qui attaquent sans demander.

### Compatibilité (`appliesTo`)

Tous les events cross-player ne s'appliquent pas à toutes les paires (combat entre pirates : oui ; alliance Marine/Pirate : non). Chaque générateur cross-player déclare sa compatibilité :

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

`appliesTo` est l'équivalent de `conditions` mais pour les paires.

### Filtrage par guild

Encounter cross-player **uniquement si les deux joueurs sont sur le même serveur Discord**. Si Rayan joue sur "OnePieceFR" et Hakim sur "PirateLand", ils ne se croisent jamais, même tous deux à East Blue.

L'engine filtre `othersInZone` sur la guild du joueur qui recap **avant** d'évaluer `appliesTo`.

> **Pourquoi :** chaque serveur Discord est sa propre "instance" du jeu. Le `!leaderboard`, les rangs de yonko, les rivalités locales — tout suppose que les interactions sociales restent dans la guild d'origine. Voir le domaine `guild_player` pour le tracking présence joueur/serveur.

### Règle clé : encounter possible uniquement avec un joueur synced past le bucket

Quand le moteur d'A processe le bucket B et veut générer un encounter avec X :

> Est-ce que `X.last_recap_at >= fin du bucket B` ?

- Oui → X a vécu ce moment dans son timeline → encounter généré, `event_instance` insérée pour A et X.
- Non → X est en retard → **skip**. X n'existe pas dans le monde à ce moment-là.

**Traduction game design : on ne croise que des joueurs qui ont déjà vécu ce moment.** Les AFK sont invisibles aux encounters tant qu'ils ne sont pas synchros.

#### Pourquoi cette règle élimine tous les conflits

Scénario problématique sans la règle : Hakim recap à 14h, encounter avec Rayan AFK, Hakim résout un combat. Rayan revient plus tard, recap, sa timeline diverge (mainstory à 13h30 → Drum). Conflit avec le combat à 14h.

Avec la règle "synced past bucket" : Hakim au bucket 14h voit que Rayan a `last_recap_at = 12h` → skip. **Aucun encounter n'est jamais généré pour un joueur AFK.** Aucun conflit possible.

#### Conséquence : encounters AFK invisibles

L'encounter Hakim-Rayan à 14h ne se produit pas si Rayan n'est pas synchro. Quand Rayan revient et recap au-delà de 14h, son moteur tire le seed du bucket 14h pour son compte. Si le seed dit "encounter avec Hakim", on revérifie : Hakim est-il synced past 14h ? Si oui, on génère l'encounter pour les deux **à ce moment-là** (au recap de Rayan).

Donc l'encounter peut quand même se produire — juste plus tard, quand les deux sont alignés.

#### Encounters en temps réel quand les deux sont synchros

Quand Rayan et Hakim sont actifs et synchros au bucket courant, le premier qui recap (= au prochain bucket complété, donc toutes les 15 min en pratique) déclenche l'encounter check, voit l'autre comme synced, et insère `event_instance` pour les deux.

L'autre joueur reçoit un DM (cf section notif) ou voit l'event au prochain `!recap`. Comme la règle "must be synced" force un recap fréquent pour pouvoir agir, l'event est traité dans la foulée.

#### Trade-off : monde "plus vide" pour les actifs

Si la moitié des joueurs sont AFK, le monde paraît plus vide pour les actifs. Trade-off accepté : sain, le monde est peuplé par ceux qui jouent, pas par des fantômes. Un joueur qui revient et `!recap` redevient visible aux autres dès que son `last_recap_at` rattrape leur fenêtre.

---

## Mainstory : chaîne d'events à conditions strictes

Pas un seul gros event "Alabasta" qui s'étire. Une **suite d'events distincts**, chacun avec ses conditions, qui se débloquent en cascade.

```ts
{ type: 'mainstory.alabasta.find_map',         conditions: ..., probability: 0.95, oneTime: true }
{ type: 'mainstory.alabasta.save_vivi',        conditions: history.has('mainstory.alabasta.find_map.resolved') && crew.has('vivi'), probability: 0.95, oneTime: true }
{ type: 'mainstory.alabasta.defeat_crocodile', conditions: history.has('mainstory.alabasta.save_vivi.resolved') && hasItem('haki'), probability: 1.0, oneTime: false }
{ type: 'mainstory.alabasta.retry_crocodile',  conditions: lastResolutionOf('mainstory.alabasta.defeat_crocodile') === 'lost', cooldown: 7200, probability: 1.0 }
```

Chaque event lit `history` pour son éligibilité. **La chaîne se forme implicitement** par les conditions.

### Pourquoi pas une colonne `mainstory_chapter` sur `player`

Stockage explicite (`player.mainstory_chapter = 3`) → fort couplage. Si on rajoute un event "retry" entre deux étapes, il faut décaler la numérotation et migrer. Si on veut un branchement (deux mainstory parallèles), seconde colonne. Si on veut un saut conditionnel (skip Alabasta si Drum fait), logique en haut.

Avec la chaîne par conditions sur `history`, tout vit dans les conditions de chaque event. Ajouter, retirer, brancher → on touche un fichier, sans migration.

### Probabilités élevées

Pour un event mainstory, `probability` est haute (0.95 ou 1.0) → au prochain bucket éligible (conditions remplies), il s'enclenche presque à coup sûr. Pas d'attente de 6 mois en RNG hostile.

---

## Notification DM

Quand un `event_instance` est créé pour un joueur **qui n'est pas en train de `!recap`**, on lui envoie un DM Discord.

Cas typique : encounter cross-player → A recap, INSERT pour A et B, A est notifié dans la conversation actuelle, B reçoit un DM.

> **DM** = Direct Message Discord du bot vers l'utilisateur.

**Best-effort** : si le joueur a désactivé les DM du bot, l'API renvoie une erreur, on l'ignore. Le joueur verra son event au prochain `!recap` manuel — pas perdu.

---

## Le contexte `ctx`

Toutes les fonctions des générateurs reçoivent `ctx` qui contient l'état du jeu visible :

- `ctx.player` — la ligne `player` actuelle
- `ctx.crew` — personnages embarqués + helpers (`has(name)`, `getByName(name)`)
- `ctx.ship` — navire et modules
- `ctx.inventory` — ressources possédées
- `ctx.history` — helpers pour lire `history` :
  - `history.has(eventType)` → `true` si déjà ce type dans le passé
  - `history.lastResolutionOf(eventType)` → le `resolutionType` de la dernière résolution (ex: `'mainstory.alabasta.defeat_crocodile.lost'`)
  - `history.countSince(eventType, durationSec)` → combien de fois dans les N dernières secondes
- `ctx.bucket_id` — bucket en cours de traitement
- `ctx.zone` — zone du joueur à ce bucket (lue depuis history)
- `ctx.othersInZone` — autres joueurs présents dans la même zone à ce bucket (cross-player)

**Pourquoi un seul objet plutôt que des paramètres positionnels :** étendre le contexte sans casser les générateurs existants. Si on ajoute `ctx.weather`, aucun fichier ne change tant qu'il ne l'utilise pas.

---

## Effets

Les conséquences mécaniques d'un event, modélisées comme un type discriminé pour application générique.

> **Type discriminé** = union TS où chaque variante est distinguée par une propriété commune (ici `type`). Permet à TS de savoir, dans `switch(effect.type)`, quels champs sont disponibles.

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

L'engine a `applyEffects(effects, ctx, transaction)` qui les applique en bloc. Chaque effet a son handler.

**Pourquoi pas appliquer directement dans `resolve` (`ctx.player.berries += 50`) :**

- Le générateur devrait parler à la DB → couplage avec Drizzle, transactions.
- Code dispersé : pour comprendre tous les effets sur les berries, il faut lire tous les générateurs.
- Difficile à tester sans monter une DB.

Avec les Effects en data : le générateur **déclare ce qu'il veut**, l'engine applique. Pure logique métier d'un côté, persistance de l'autre.

---

## Couplage avec `history`

À chaque résolution, une entrée part dans `history` :

- `event_type` = le `resolutionType` retourné par le générateur (ex: `mainstory.alabasta.defeat_crocodile.won`)
- `actor_player_id` = joueur qui a déclenché l'event (ou `NULL` pour events système)
- `target_type` + `target_id` = optionnel, sur quoi porte l'event
- `bucket_id` = bucket dans lequel l'event a été généré (pour idempotence, cf optims)
- `payload` = données utiles pour les futurs lookups (montant gagné, choix fait, qui a perdu...)

C'est cette table qui rend possible :

- les `conditions` qui regardent le passé,
- les `cooldown`,
- les `oneTime`,
- la mainstory qui se déroule,
- les events qui réagissent au passé (refus répétés d'une île → nausée).

---

## Catalogue minimal pour démarrer

Pour valider l'archi :

- `ambient.seagull_flyby` — purement décoratif
- `ambient.calm_sea` / `ambient.rough_sea` — du remplissage
- `fishing.barrel_found` — premier stateful simple, 1 step
- `combat.pirates_encounter` — premier cross-player

Pas la peine d'écrire 50 générateurs avant d'avoir un moteur qui tourne.

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
export const allGenerators: Array<EventGenerator> = [
  seagullFlyby,
  calmSea,
  barrelFound,
  piratesEncounter,
  ...
];
```

Le moteur itère cette liste à chaque bucket.

**Pourquoi un registry centralisé et pas un autoload depuis le filesystem :** l'autoload marche mais (1) plus dur à tester (imports dynamiques), (2) plus dur de désactiver temporairement un générateur (faut renommer le fichier), (3) moins explicite (pas de point d'entrée clair). Avec un registry explicite, la liste de tous les events actifs est immédiate.

---

## Ajouter un nouvel event

1. Créer `generators/<famille>/<nom>.ts`.
2. Exporter un `EventGenerator` qui respecte le contrat (`types.ts`).
3. L'ajouter dans `registry.ts`.
4. Si nouveau type d'effet : étendre l'union `Effect` + ajouter le handler dans `apply-effects.ts`.
5. Si nouveau `resolutionType` dans `history` : déclarer le payload dans `apps/bot/src/domains/history/types/event.ts` (cf doc `history.md`).

Pas de migration, pas de table à toucher — sauf nouveau type d'effet inédit.

---

## Optimisations & correctness

À implémenter dès la première version (pas en YAGNI), sinon on les ajoute en urgence quand un truc casse.

### 1. Pré-agréger `history` en mémoire au début du recap

Sans ça : 50 générateurs × 192 buckets × 2-3 lookups = ~30 000 requêtes pour un seul recap.

**Fix :** une seule requête au début de `process-recap` charge toute l'history pertinente :

```ts
const playerHistory = await client
  .select()
  .from(history)
  .where(and(eq(history.actorPlayerId, playerId), gte(history.occurredAt, since)));
```

Puis `ctx.history` interroge ce tableau en mémoire :

```ts
ctx.history = {
  has: (type) => playerHistory.some((e) => e.eventType === type),
  lastResolutionOf: (prefix) => playerHistory.filter((e) => e.eventType.startsWith(prefix)).at(-1)?.eventType,
  countSince: (type, sec) => playerHistory.filter((e) => e.eventType === type && e.occurredAt > Date.now() - sec * 1000).length,
};
```

> **Note** : pour les events `oneTime` qui doivent matcher "depuis toujours", soit charger toute l'history (cher si 100k events), soit faire une requête séparée ciblée. À voir à l'implém.

### 2. Idempotence des effets ambient via `bucket_id` dans `history`

Si la transaction échoue à mi-parcours et qu'on retry, les effets ambient peuvent être appliqués deux fois — Postgres protège **dans la même transaction**, mais pas contre un retry après échec.

**Fix :** colonne `bucket_id bigint` (nullable) sur `history`, et avant d'insérer un ambient, vérifier qu'il n'existe pas déjà pour `(player_id, event_type, bucket_id)`. Index unique partiel :

```sql
CREATE UNIQUE INDEX history_idempotence_idx
  ON history (actor_player_id, event_type, bucket_id)
  WHERE bucket_id IS NOT NULL;
```

Retry → INSERT fail → skip silencieux → pas de double-spend.

> **Pourquoi pas pour les stateful** : `event_instance` a déjà sa contrainte `(player_id, type, bucket_id)`. Ce sont les ambient qu'il faut couvrir parce qu'ils ne passent pas par `event_instance`.

### 3. Index `history` pour le hot path

Les filtres `cooldown` et `oneTime` font `WHERE actor_player_id = ? AND event_type = ?`. L'index existant `(actor_player_id, occurred_at desc)` aide pour le tri mais pas pour le filtre sur `event_type`.

Avec l'optim 1 (pré-agrégation), c'est moins critique. Mais pour les requêtes ad-hoc (debug, analytics) :

```sql
CREATE INDEX history_actor_event_type_idx
  ON history (actor_player_id, event_type, occurred_at DESC);
```

### 4. Custom_id Discord compact

Discord cape les `custom_id` à **100 caractères**. Un nom comme `mainstory.alabasta.defeat_crocodile` (37 chars) + métadonnées (`:step:opener:choice:haki`) flirte avec la limite. Pour des events plus profonds (`mainstory.skypiea.zone_2.altar.choice_2`) ça dépasse.

**Fix :** stocker `event_instance.id` (entier) + `choice_id` court :

```
custom_id = "evt:1234:open"
```

C'est `event_instance` (en DB) qui porte la réf au type et à l'étape. Au handler : parser `1234` et `open`, charger la ligne, dispatch.

Avantages :

- Limite 100 chars largement respectée même pour les events très profonds.
- ID changeant → impossible de "rejouer" un vieux bouton après suppression de l'event_instance (handler retourne "trop tard, l'autre a déjà choisi").

### 5. Validation des `goTo` au démarrage

Sans : `goTo: 'haki_charegd'` (typo) → erreur uniquement au runtime, sur le bucket d'un joueur précis qui clique. Cool en prod.

**Fix :** au boot, parser tous les générateurs et vérifier que tous les `goTo` pointent vers des steps existants. Throw au boot, pas en prod runtime.

```ts
function validateGenerators(generators: Array<EventGenerator>) {
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

À appeler au boot, après chargement du registry.

> **Limite** : `choices` étant une fonction qui prend `ctx`, on ne valide pas les choix conditionnels. On valide juste les choix de base, ce qui couvre 90% des typos. Le reste : test snapshot par générateur (futur).

### 6. Cap sur la fenêtre du recap (déjà décidé : 48h)

Au max 48h de buckets rejoués, peu importe la durée AFK. Évite l'explosion de calcul, et game design clair ("tu vois les events des dernières 48h").

---

## Résumé

- **Tout est lazy** : pas de cron, calcul au `!recap`. Coût d'infra zéro hors usage.
- **Règle fondatrice : synchro pour agir.** `last_recap_at` à jour + aucun stateful en attente. Sinon redirection vers `!recap`.
- **Buckets de 15 min + seed déterministe** : rencontres auto-synchronisées sans communication. Pas de table partagée.
- **Ambient = jeté à la volée. Stateful = persisté en `event_instance`.** Besoins différents.
- **1 stateful en attente max par joueur** : narration linéaire.
- **Cross-player en first-clicker-wins** : pas d'attente, pas de blocage.
- **Cross-player filtré par guild** : rencontres dans le serveur Discord d'origine.
- **Encounter possible uniquement entre joueurs synced past le bucket** : AFK invisibles aux autres. Plus aucune incohérence temporelle.
- **`conditions`, `cooldown`, `oneTime` → tous lus depuis `history`.** Pas de table en plus.
- **`zone_presence` séparé de `history`** : projection dénormalisée pour "qui était dans Z à T".
- **Multi-étapes via graphe d'étapes nommées** : déclaratif, lisible, scalable.
- **Mainstory = chaîne d'events à conditions strictes**. Pas de pointeur "next step" stocké.
- **Effets en data**, appliqués par l'engine. Le générateur reste pure logique.
- **DM best-effort** quand un event est créé pour un joueur AFK.
- **Cap 48h** pour les retours après AFK long.
- **Pré-agrégation `history` en mémoire** au début du recap : 1 requête, le reste en RAM.
- **Idempotence ambient via `bucket_id` dans `history`** + unique index partiel.
- **`custom_id` Discord compact** : `evt:<id>:<choice>`.
- **Validation des `goTo` au boot** : typos détectées avant prod.
