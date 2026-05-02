# Performance & correctness

À implémenter dès la première version (pas en YAGNI), sinon on les ajoute en urgence quand un truc casse.

## 1. Pré-agréger `history` en mémoire au début du recap

Sans : 50 générateurs × 192 buckets × 2-3 lookups = **~30 000 requêtes** pour un seul recap.

**Fix** : une seule requête au début de `process-recap` charge l'history pertinente :

```ts
const playerHistory = await client
  .select()
  .from(history)
  .where(and(eq(history.actorPlayerId, playerId), gte(history.occurredAt, since)));
```

`ctx.history` interroge ensuite ce tableau en mémoire :

```ts
ctx.history = {
  has: (type) => playerHistory.some((e) => e.eventType === type),
  lastResolutionOf: (prefix) => playerHistory.filter((e) => e.eventType.startsWith(prefix)).at(-1)?.eventType,
  countSince: (type, sec) => playerHistory.filter((e) => e.eventType === type && e.occurredAt > Date.now() - sec * 1000).length,
};
```

> **Note** : pour les events `oneTime` qui doivent matcher "depuis toujours", soit charger toute l'history (cher si 100k events), soit faire une requête séparée ciblée. À voir à l'implém.

## 2. Idempotence des ambient via `bucket_id` dans `history`

Si la transaction échoue à mi-parcours et qu'on retry, les effets ambient peuvent être appliqués deux fois — Postgres protège **dans la même transaction**, pas contre un retry après échec.

**Fix** : colonne `bucket_id bigint` (nullable) sur `history`, et avant d'insérer un ambient, vérifier qu'il n'existe pas déjà pour `(player_id, event_type, bucket_id)`. Index unique partiel :

```sql
CREATE UNIQUE INDEX history_idempotence_idx
  ON history (actor_player_id, event_type, bucket_id)
  WHERE bucket_id IS NOT NULL;
```

Retry → INSERT fail → skip silencieux → pas de double-spend.

> **Pourquoi pas pour les stateful** : `event_instance` a déjà sa contrainte `(player_id, type, bucket_id)`. Les ambient n'y passent pas, donc il faut les couvrir ailleurs.

## 3. Index `history` pour le hot path

Les filtres `cooldown` et `oneTime` font `WHERE actor_player_id = ? AND event_type = ?`. L'index existant `(actor_player_id, occurred_at desc)` aide pour le tri mais pas pour le filtre `event_type`.

Avec l'optim 1 (pré-agrégation), c'est moins critique. Pour les requêtes ad-hoc (debug, analytics) :

```sql
CREATE INDEX history_actor_event_type_idx
  ON history (actor_player_id, event_type, occurred_at DESC);
```

## 4. `custom_id` Discord compact

Discord cape les `custom_id` à **100 caractères**. `mainstory.alabasta.defeat_crocodile` (37 chars) + `:step:opener:choice:haki` flirte avec la limite. Pour `mainstory.skypiea.zone_2.altar.choice_2` ça dépasse.

**Fix** : stocker `event_instance.id` (entier) + `choice_id` court :

```
custom_id = "evt:1234:open"
```

C'est `event_instance` (en DB) qui porte la réf au type et à l'étape. Au handler : parser `1234` et `open`, charger la ligne, dispatch.

| Avantage         | Détail                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Limite 100 chars | Largement respectée même pour des events profonds.                                                                              |
| ID changeant     | Impossible de "rejouer" un vieux bouton après suppression de l'event_instance (handler retourne "trop lent, l'autre a choisi"). |

## 5. Validation des `goTo` au boot

Sans : `goTo: 'haki_charegd'` (typo) → erreur uniquement au runtime, sur le bucket d'un joueur précis qui clique. Cool en prod.

**Fix** : au boot, parser tous les générateurs et vérifier que tous les `goTo` pointent vers des steps existants. Throw au boot, pas en prod runtime.

```ts
function validateGenerators(generators: Array<EventGenerator>) {
  for (const gen of generators) {
    if (gen.scope !== 'stateful') continue;
    const stepNames = Object.keys(gen.steps);
    for (const [stepName, step] of Object.entries(gen.steps)) {
      for (const choice of step.choices(/* ctx fake */)) {
        if (choice.goTo && !stepNames.includes(choice.goTo)) {
          throw new Error(`Generator ${gen.type}, step ${stepName}, choice ${choice.id}: goTo '${choice.goTo}' n'existe pas dans steps`);
        }
      }
    }
  }
}
```

À appeler au boot, après chargement du registry.

> **Limite** : `choices` étant une fonction de `ctx`, on ne valide pas les choix conditionnels. On couvre ~90% des typos. Le reste : test snapshot par générateur (futur).

## 6. Cap 48h sur la fenêtre de recap

Cf [recap-flow.md](./recap-flow.md). Au max 48h de buckets rejoués peu importe la durée AFK : évite l'explosion de calcul, et donne un game design clair ("tu vois les events des dernières 48h").
