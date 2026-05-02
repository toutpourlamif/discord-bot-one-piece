# Modèle de données

Trois tables, chacune avec un rôle clair.

## `event_instance` — queue des events non consommés

Contient à la fois les ambient en attente d'affichage et les stateful en attente de décision. Une ligne disparaît quand le joueur "consomme" l'event (clic "Suivant" pour ambient, clic sur un choix pour stateful).

| Colonne        | Type                        | Rôle                                                                                          |
| -------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `id`           | bigserial PK                | identifiant unique                                                                            |
| `player_id`    | integer FK                  | propriétaire                                                                                  |
| `type`         | text                        | identifiant du générateur (`mainstory.alabasta.find_map`)                                     |
| `scope`        | enum `ambient` / `stateful` | détermine le mode d'affichage (Suivant vs choix) et le timing des effets                      |
| `bucket_id`    | bigint                      | bucket dans lequel l'event a été tiré (sert aussi à l'ordre d'affichage)                      |
| `encounter_id` | bigint, null                | relie les events cross-player (deux lignes liées)                                             |
| `state`        | jsonb                       | ambient : snapshot pour `render(state)` ; stateful multi-step : `{ step: 'haki_charged', … }` |
| `created_at`   | timestamptz                 |                                                                                               |

> **`bigserial`** = compteur 64 bits auto-incrémenté. **PK** = primary key. **FK** = foreign key (Postgres garantit la référence). **`jsonb`** = JSON binaire interrogeable et indexable.

**Contrainte unique : `(player_id, type, bucket_id)`** — base de l'**idempotence**. Si le calcul d'un bucket est rejoué (retry après échec de transaction, double `!recap`), le moteur regénère le même event depuis le même seed → INSERT en doublon refusé silencieusement.

> **Idempotence** = opération qu'on peut appeler N fois avec le même résultat qu'une seule. "Marquer comme lu" : idempotent. "Envoyer email" : non.

### Lifecycle

| Phase                    | Ambient                                          | Stateful                                                        |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------------- |
| Calcul (`!recap` engine) | INSERT row + effets appliqués + INSERT `history` | INSERT row (state initial), pas d'effet, pas d'`history` encore |
| Clic joueur              | "Suivant" → DELETE row                           | Choix → effets appliqués + DELETE row + INSERT `history`        |

> **Pourquoi pas un champ `status: 'consumed'`** : la table grossirait indéfiniment alors qu'aucun usage des consumed (l'archive est dans `history`). DELETE = plus propre, moins d'index.

> **`event_instance` n'est PAS append-only** : UPDATE du `state` à chaque transition d'un stateful multi-step, DELETE à la consommation. C'est un "panier en cours", pas un log. `history` est l'archive immuable.

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

| Colonne                     | Rôle                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `event_type`                | le `resolutionType` retourné par le générateur (ex: `mainstory.alabasta.defeat_crocodile.won`) |
| `actor_player_id`           | joueur déclencheur, ou `NULL` pour events système                                              |
| `target_type` + `target_id` | optionnel, sur quoi porte l'event                                                              |
| `bucket_id`                 | bucket d'origine de l'event                                                                    |
| `payload`                   | données utiles aux futurs lookups (montant gagné, choix fait, qui a perdu…)                    |

`history` rend possibles : `conditions`, `cooldown`, `oneTime`, mainstory, et tout event qui réagit au passé.

## Transactions

**Tout `!recap` tient dans une seule transaction Drizzle.** Si l'INSERT d'un `event_instance` foire après application d'un effet ambient (+50 berries), le joueur ne garde pas les berries sans la trace.

Tout changement de zone : UPDATE `zone_presence` + INSERT `zone_presence` + INSERT `history.player.zone_changed` dans la même transaction.
