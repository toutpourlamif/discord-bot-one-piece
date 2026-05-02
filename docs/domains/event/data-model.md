# Modèle de données

Trois tables, chacune avec un rôle clair.

## `event_instance` — stateful en cours

| Colonne        | Type         | Rôle                                                              |
| -------------- | ------------ | ----------------------------------------------------------------- |
| `id`           | bigserial PK | identifiant unique                                                |
| `player_id`    | integer FK   | propriétaire                                                      |
| `type`         | text         | identifiant du générateur (`mainstory.alabasta.find_map`)         |
| `bucket_id`    | bigint       | bucket dans lequel l'event a été tiré                             |
| `encounter_id` | bigint, null | relie les events cross-player (deux lignes liées)                 |
| `state`        | jsonb        | étape actuelle pour les multi-étapes (`{ step: 'haki_charged' }`) |
| `created_at`   | timestamptz  |                                                                   |

> **`bigserial`** = compteur 64 bits auto-incrémenté. **PK** = primary key. **FK** = foreign key (Postgres garantit la référence). **`jsonb`** = JSON binaire interrogeable et indexable.

**Contrainte unique : `(player_id, type, bucket_id)`** — base de l'**idempotence**. Si `!recap` est rejoué deux fois, le moteur regénère le même event depuis le même seed → INSERT en doublon refusé silencieusement.

> **Idempotence** = opération qu'on peut appeler N fois avec le même résultat qu'une seule. "Marquer comme lu" : idempotent. "Envoyer email" : non.

### Une fois résolu : DELETE

`event_instance` ne contient que ce qui est en cours. Une fois résolu, ligne supprimée, trace dans `history`.

> **Pourquoi pas un champ `status: 'resolved'`** : la table grossirait indéfiniment alors qu'aucun usage des resolved (info utile dans `history`). DELETE = plus propre, moins d'index.

> **Append-only** = on n'ajoute que des lignes, jamais d'UPDATE/DELETE. C'est le contrat de `history`. `event_instance` n'est PAS append-only : UPDATE du `state` à chaque transition, DELETE à la résolution. C'est un "panier en cours", pas un log.

## `zone_presence` — historique des zones par intervalles

Détails et justification dans [cross-player.md](./cross-player.md).

| Colonne      | Type        | Rôle                  |
| ------------ | ----------- | --------------------- |
| `player_id`  | integer FK  |                       |
| `zone`       | enum        |                       |
| `entered_at` | timestamptz |                       |
| `left_at`    | timestamptz | NULL si zone actuelle |

PK `(player_id, entered_at)`. Index `(zone, entered_at, left_at)` pour "qui était dans Z à T".

Projection dénormalisée maintenue dans la même transaction qu'un changement de zone (cf cross-player).

## `history` — log append-only

Cf doc dédiée `history.md`. Lignes pertinentes pour le domaine event :

| Colonne                     | Rôle                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `event_type`                | le `resolutionType` retourné par le générateur (ex: `mainstory.alabasta.defeat_crocodile.won`)        |
| `actor_player_id`           | joueur déclencheur, ou `NULL` pour events système                                                     |
| `target_type` + `target_id` | optionnel, sur quoi porte l'event                                                                     |
| `bucket_id`                 | bucket d'origine — utilisé pour l'**idempotence des ambient** (cf [performance.md](./performance.md)) |
| `payload`                   | données utiles aux futurs lookups (montant gagné, choix fait, qui a perdu…)                           |

`history` rend possibles : `conditions`, `cooldown`, `oneTime`, mainstory, et tout event qui réagit au passé.

## Transactions

**Tout `!recap` tient dans une seule transaction Drizzle.** Si l'INSERT d'un `event_instance` foire après application d'un effet ambient (+50 berries), le joueur ne garde pas les berries sans la trace.

Tout changement de zone : UPDATE `zone_presence` + INSERT `zone_presence` + INSERT `history.player.zone_changed` dans la même transaction.
