# Générateurs d'events

Un **générateur** définit quand et comment un event apparaît. **Un fichier par générateur**, listés dans `registry.ts`. Le moteur itère cette liste à chaque bucket.

## Forme ambient

Deux fonctions distinctes :

- `build(ctx, rng)` → appelée au calcul (engine). Retourne `{ effects, state }`. Le `state` capture **tout ce qui dépend de `ctx` ou `rng`** au moment du bucket.
- `render(state)` → appelée au clic "Suivant". Pure : `state → embed`. **Ne reçoit pas `ctx`.**

```ts
const seagullFlyby: AmbientGenerator = {
  type: 'ambient.seagull_flyby',
  scope: 'ambient',
  conditions: (ctx) => ctx.zone === 'east_blue', // optionnel
  cooldown: 1800, // optionnel : 30 min via history
  probability: () => 0.3, // 30% / bucket éligible

  build: () => ({
    effects: [],
    state: {},
  }),

  render: () =>
    makeEmbed({
      title: 'Une mouette passe au-dessus du navire.',
      image: { url: 'https://cdn.../seagull.png' },
    }),
};
```

### Ambient avec contenu stochastique ou ctx-dépendant

Tout ce qui vient de `rng` ou `ctx` doit être **figé dans `state`** au `build`, pour que `render` puisse le retrouver à l'identique au clic.

```ts
const fishingHaul: AmbientGenerator = {
  type: 'ambient.fishing_haul',
  scope: 'ambient',
  conditions: (ctx) => ctx.zone === 'east_blue',
  probability: () => 0.2,

  build: (ctx, rng) => {
    const hasFishman = ctx.crew.has('fishman');
    const base = 50 + Math.floor(rng.next() * 50);
    const bonus = hasFishman ? base : 0; // homme-poisson double la prise

    return {
      effects: [{ type: 'addBerries', amount: BigInt(base + bonus) }],
      state: { base, bonus, hadFishman: hasFishman },
    };
  },

  render: (state) =>
    state.hadFishman
      ? makeEmbed(`Ton homme-poisson plonge et ramène ${state.base + state.bonus} berries (${state.base} + ${state.bonus} bonus).`)
      : makeEmbed(`Tu pêches ${state.base} berries.`),
};
```

> **Pourquoi `render` n'a pas `ctx`** : un event ambient est un snapshot du passé. Si `render` lisait le ctx actuel, on aurait des incohérences narratives ("Ton homme-poisson plonge…" alors qu'il a quitté l'équipage entre-temps), ou pire un embed qui ne correspond plus à l'effet réellement appliqué. Tout ce qui est nécessaire au rendu doit être figé dans `state` au `build`.

> **Cas limite — afficher du présent** (ex: "Tu as maintenant X berries au total") : ça relève d'un message de suivi, pas du contenu de l'event. À gérer hors générateur, dans le code qui orchestre l'affichage de la queue.

## Forme stateful 1 étape

```ts
const barrelFound: EventGenerator = {
  type: 'fishing.barrel_found',
  scope: 'stateful',
  probability: () => 0.1,
  initial: 'choice',
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
```

À retenir :

- **Ambient** : `build(ctx, rng)` au calcul, `render(state)` au clic. `render` est pure sur `state`.
- **Stateful** : graphe de `steps` nommées. Chaque étape : `embed(state, ctx)` + `choices(state, ctx)`. Chaque choix : `goTo` (transition) ou `resolve` (résolution finale).
- `resolve(ctx, rng)` retourne `{ embed, effects, resolutionType }`. C'est là que les effets stateful sont appliqués (≠ ambient où c'est au `build`).

## Forme stateful multi-étapes (graphe)

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
```

`state` jsonb stocke juste `{ step: 'haki_charged' }`. Étapes peuvent se rejoindre, cycler.

> **Pourquoi un graphe nommé et pas un gros switch** : chaque étape explicite, chaque choix dit ce qu'il fait, dispatch fait par l'engine, handlers réutilisables (`fightLow` / `fightHigh`). Une soupe de `if` pour 8 étapes devient illisible.

## Logique conditionnelle dans les étapes

`embed`, `choices`, `resolve` reçoivent `ctx`. On adapte en temps réel.

```ts
choices: (ctx) =>
  [
    { id: 'leave', label: 'Passer', resolve: leaveMerchant },

    ctx.crew.has('nami') && {
      id: 'haggle',
      label: 'Marchander (Nami)',
      goTo: 'haggle_attempt',
    },

    ctx.player.berries >= 100_000n && {
      id: 'buy',
      label: 'Acheter (100 000 ฿)',
      resolve: buyMerchant,
    },
  ].filter(Boolean),
```

> **On filtre les choix non-éligibles plutôt que de les griser** : moins de bruit visuel, cohérent avec le reste du bot (cf `set-captain.ts`).

## Filtres avant tirage

Évalués en ordre, premier qui échoue → skip.

| Filtre             | Type                 | Effet                                                 |
| ------------------ | -------------------- | ----------------------------------------------------- |
| `conditions(ctx)`  | dur (gameplay)       | `false` → skip. Aucune proba ne rattrape.             |
| `cooldown: 86400`  | anti-spam (sec)      | `history` "déclenché dans les N sec ?" → skip si oui. |
| `oneTime: true`    | unique à vie         | `history` "déjà déclenché une fois ?" → skip si oui.  |
| `probability(ctx)` | tirage final ∈ [0,1] | comparé à `rng.next()` ; échec → skip.                |

**Tous lus depuis `history`.** Pas de colonne par compteur sur `player` (`barrel_count_24h`, `kraken_count_lifetime`, …). Avantage immense : ajouter un filtre ne demande aucune migration.

## Mainstory : chaîne par conditions

Pas un gros event "Alabasta". Une **suite d'events distincts** qui se débloquent par leurs `conditions` :

```ts
{ type: 'mainstory.alabasta.find_map',         conditions: ..., oneTime: true,  probability: 0.95 }
{ type: 'mainstory.alabasta.save_vivi',        conditions: history.has('...find_map.resolved') && crew.has('vivi'), oneTime: true, probability: 0.95 }
{ type: 'mainstory.alabasta.defeat_crocodile', conditions: history.has('...save_vivi.resolved') && hasItem('haki'), probability: 1.0 }
{ type: 'mainstory.alabasta.retry_crocodile',  conditions: lastResolutionOf('...defeat_crocodile') === 'lost', cooldown: 7200 }
```

`probability` haute (0.95–1.0) : pas d'attente RNG hostile une fois éligible.

> **Pourquoi pas une colonne `mainstory_chapter` sur `player`** : couplage fort, migration à chaque insertion d'étape, branchements impossibles, sauts conditionnels lourds. Avec la chaîne par `conditions` : ajouter, retirer, brancher → un fichier, pas de migration.

## `ctx` : objet contexte

| Champ              | Contenu                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `ctx.player`       | ligne `player` actuelle                                                    |
| `ctx.crew`         | personnages embarqués + `has(name)`, `getByName(name)`                     |
| `ctx.ship`         | navire et modules                                                          |
| `ctx.inventory`    | ressources                                                                 |
| `ctx.history`      | helpers : `has(type)`, `lastResolutionOf(prefix)`, `countSince(type, sec)` |
| `ctx.bucket_id`    | bucket en cours                                                            |
| `ctx.zone`         | zone du joueur à ce bucket                                                 |
| `ctx.othersInZone` | autres joueurs présents (cross-player, déjà filtrés par guild)             |

> **Pourquoi un objet plutôt que des paramètres positionnels** : ajouter `ctx.weather` ne casse aucun générateur existant.

## Effets

Les conséquences mécaniques sont **déclarées en data**, jamais appliquées par le générateur.

```ts
type Effect =
  | { type: 'addBerries'; amount: bigint }
  | { type: 'spendBerries'; amount: bigint }
  | { type: 'addBounty'; amount: bigint }
  | { type: 'addItem'; item: string }
  | { type: 'addStatus'; status: 'wounded' | 'sick' | ... }
  | { type: 'addMorale'; amount: number };
```

L'engine a `applyEffects(effects, ctx, transaction)` qui dispatch chaque variante.

> **Pourquoi pas `ctx.player.berries += 50` dans `resolve`** : couple le générateur à Drizzle / aux transactions, disperse le code (impossible de retrouver tous les effets sur les berries), difficile à tester. Avec Effects en data : pure logique métier d'un côté, persistance de l'autre.

> **Type discriminé** = union TS où chaque variante est distinguée par une propriété commune (ici `type`). TS sait, dans `switch(effect.type)`, quels champs sont disponibles.

## Couplage avec `history`

Une ligne `history` est écrite (cf doc dédiée `history.md`) :

- pour un **ambient** : à l'engine, en même temps que l'INSERT `event_instance` et l'application des effets.
- pour un **stateful** : à la résolution, quand le joueur a cliqué un choix.

Champs :

- `event_type` = type ambient (ex: `ambient.fishing_haul`) ou `resolutionType` du choix stateful (ex: `mainstory.alabasta.defeat_crocodile.won`).
- `actor_player_id` = joueur déclencheur, ou `NULL` pour events système.
- `target_type` + `target_id` = optionnel.
- `bucket_id` = bucket d'origine.
- `payload` = données utiles (montant gagné, choix fait, qui a perdu…).

C'est cette table qui rend possibles `conditions`, `cooldown`, `oneTime`, mainstory, et tout event qui réagit au passé.

## Ajouter un nouvel event

1. Créer `generators/<famille>/<nom>.ts`.
2. Exporter un `EventGenerator` qui respecte le contrat (`types.ts`).
3. L'ajouter dans `registry.ts`.
4. Si nouveau type d'effet : étendre l'union `Effect` + ajouter le handler dans `apply-effects.ts`.
5. Si nouveau `resolutionType` : déclarer le payload dans `apps/bot/src/domains/history/types/event.ts` (cf `history.md`).

Pas de migration, sauf nouveau type d'effet inédit.
