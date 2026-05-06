# Modèle de données

Deux tables, chacune avec un rôle clair. La position courante des joueurs (utilisée pour les encounters cross-player) vit sur `player.current_zone` — voir le domaine `player`.

## `event_instance` — queue des events non consommés

Contient à la fois les passive en attente d'affichage et les interactive en attente de décision. Une ligne disparaît quand le joueur "consomme" l'event (clic "Suivant" pour passive, clic sur un choix pour interactive).

| Colonne          | Type         | Rôle                                                                                             |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| `id`             | bigserial PK | identifiant unique                                                                               |
| `player_id`      | integer FK   | propriétaire                                                                                     |
| `event_key`      | text         | identifiant du générateur (`mainstory.alabasta.find_map`) — = `EventGenerator.type`              |
| `is_interactive` | boolean      | détermine le mode d'affichage (Suivant vs choix) et le timing des effets                         |
| `bucket_id`      | integer      | bucket dans lequel l'event a été tiré (sert aussi à l'ordre d'affichage)                         |
| `encounter_id`   | bigint, null | relie les events cross-player (deux lignes liées) — // TODO: pas encore en schéma                |
| `state`          | jsonb        | passive : snapshot pour `render(state)` ; interactive multi-step : `{ step: 'haki_charged', … }` |
| `created_at`     | timestamptz  |                                                                                                  |

> **`bigserial`** = compteur 64 bits auto-incrémenté. **PK** = primary key. **FK** = foreign key (Postgres garantit la référence). **`jsonb`** = JSON binaire interrogeable et indexable.

**Contrainte unique : `(player_id, event_key, bucket_id)`** — base de l'**idempotence**. Si le calcul d'un bucket est rejoué (retry après échec de transaction, double `!recap`), le moteur regénère le même event depuis le même seed → INSERT en doublon refusé silencieusement.

> **Idempotence** = opération qu'on peut appeler N fois avec le même résultat qu'une seule. "Marquer comme lu" : idempotent. "Envoyer email" : non.

### Lifecycle

| Phase                    | Passive                                          | Interactive                                                     |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------------- |
| Calcul (`!recap` engine) | INSERT row + effets appliqués + INSERT `history` | INSERT row (state initial), pas d'effet, pas d'`history` encore |
| Clic joueur              | "Suivant" → DELETE row                           | Choix → effets appliqués + DELETE row + INSERT `history`        |

> **Pourquoi pas un champ `status: 'consumed'`** : la table grossirait indéfiniment alors qu'aucun usage des consumed (l'archive est dans `history`). DELETE = plus propre, moins d'index.

> **`event_instance` n'est PAS append-only** : UPDATE du `state` à chaque transition d'un interactive multi-step, DELETE à la consommation. C'est un "panier en cours", pas un log. `history` est l'archive immuable.

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

**Tout `!recap` tient dans une seule transaction Drizzle.** Si l'INSERT d'un `event_instance` foire après application d'un effet passive (+50 berries), le joueur ne garde pas les berries sans la trace.

Tout changement de zone : UPDATE `player.current_zone` + INSERT `history.player.zone_changed` dans la même transaction.
