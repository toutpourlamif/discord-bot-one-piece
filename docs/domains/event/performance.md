# Performance & correctness

À implémenter dès la première version (pas en YAGNI), sinon on les ajoute en urgence quand un truc casse.

## 1. Pré-agréger `history` en mémoire au début du recap

Sans : 50 générateurs × 192 buckets × 2-3 lookups = **~30 000 requêtes** pour un seul recap.

**Fix** : une seule requête au début de `process-recap` charge **toute** l'history du joueur :

```ts
const playerHistory = await client.select().from(history).where(eq(history.actorPlayerId, playerId));
```

`ctx.history` interroge ensuite ce tableau en mémoire :

```ts
ctx.history = {
  has: (type) => playerHistory.some((e) => e.eventType === type),
  lastResolutionOf: (prefix) => playerHistory.filter((e) => e.eventType.startsWith(prefix)).at(-1)?.eventType,
  countSinceBuckets: (type, buckets) =>
    playerHistory.filter((e) => e.eventType === type && e.bucketId !== null && e.bucketId > currentBucket - buckets).length,
};
```

> **Pourquoi tout charger et pas juste les N derniers jours** : les filtres `oneTime` ont besoin du "depuis toujours". Tronquer la fenêtre forcerait des requêtes séparées au cas par cas, ce qui annule l'optimisation. Le volume reste raisonnable (quelques milliers de lignes par joueur même après des mois de jeu actif).

## 2. Idempotence garantie par `event_instance`

L'unicité `(player_id, event_key, bucket_id)` sur `event_instance` (cf [data-model.md](./data-model.md)) couvre tout : passive comme interactive y passent, donc un retry après échec ou un double `!recap` simultané se résout par un conflit refusé silencieusement.

**Implémentation** : utiliser `INSERT ... ON CONFLICT DO NOTHING` côté engine. Sinon une ligne déjà tracée bloque toute la transaction du recap au moindre retry.

> **Pas besoin d'une protection séparée sur `history`** : l'INSERT `history` (pour passive) se fait dans la même transaction que l'INSERT `event_instance`. Si l'`event_instance` est rejeté pour doublon, le `history` correspondant n'est jamais inséré non plus. Pas de drift possible.

## 3. Index `history` pour le hot path

Les filtres `cooldownBuckets` et `oneTime` font `WHERE actor_player_id = ? AND event_type = ?`. L'index existant `(actor_player_id, occurred_at desc)` aide pour le tri mais pas pour le filtre `event_type`.

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
    if (!gen.isInteractive) continue;
    const stepNames = Object.keys(gen.steps);
    for (const [stepName, step] of Object.entries(gen.steps)) {
      for (const choice of step.choices(/* ctx fake */)) {
        if (choice.goTo && !stepNames.includes(choice.goTo)) {
          throw new Error(`Generator ${gen.key}, step ${stepName}, choice ${choice.id}: goTo '${choice.goTo}' n'existe pas dans steps`);
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
