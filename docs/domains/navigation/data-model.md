# Modèle de données

Ce que la navigation ajoute à la base de données.

## Nouvelles colonnes sur `player`

Trois colonnes pour suivre l'état de voyage du joueur :

| Colonne                 | Type         | Quand c'est rempli                                                |
| ----------------------- | ------------ | ----------------------------------------------------------------- |
| `travel_target_zone`    | text NULL    | Si le joueur est en mer : l'île qu'il vise. NULL s'il est ancré.  |
| `travel_started_bucket` | integer NULL | Le bucket où il a quitté son île précédente. NULL s'il est ancré. |
| `travel_eta_bucket`     | integer NULL | Le bucket auquel il devrait arriver. NULL s'il est ancré.         |

Quand le joueur **part**, les trois colonnes se remplissent.
Quand il **arrive** (ou qu'il **dérive**), les trois colonnes se vident.
Quand il **change de cap pendant le trajet**, on garde `travel_started_bucket` mais on met à jour `travel_target_zone` et `travel_eta_bucket`.

## Nouveaux items dans l'inventaire

On suit le pattern existant du projet : chaque type d'item est **une ligne dans `resource_template`** identifiée par son `name`. On lookup par nom (`inventory.has('Log Pose')`).

### Le Log Pose

Une seule ligne `resource_template` :

| name     |
| -------- |
| Log Pose |

Le joueur en possède UN ou 0 (vendu, perdu, volé).

- Obtenu typiquement dans la main story (reverse mountain)
- Peut être **perdu** lors d'un combat ou d'un naufrage.
- Peut être **acheté** chez certains marchands. (events quand on s'aperçoit qu'il en a plus)

### Les Eternal Poses

**Une ligne `resource_template` par île traçable**. Le nom encode la destination :

| name                   |
| ---------------------- |
| Eternal Pose - Drum    |
| Eternal Pose - Skypiea |
| Eternal Pose - Water 7 |
| ...                    |

Un joueur peut en posséder plusieurs, mais un seul exemplaire de chaque. Chacun est verrouillé sur l'île écrite dans son nom.

- Obtenu généralement comme récompense rare d'un event spécifique à une île.
- Permanent (ne se perd pas en combat, mais peut être volé via certains events).

## L'enum des zones

Tous les noms de zones (îles et mers) vivent dans **un même enum Postgres** `zone_enum`. C'est ce qu'utilisent `player.current_zone` et `player.travel_target_zone`.

L'enum est **dérivé** des deux arrays TypeScript `ISLANDS` et `SEAS` (cf [world.md](./world.md) §"Single source of truth"). On ne maintient pas la liste à deux endroits.

V1 :

- Islands : `foosha`, `loguetown`, `reverse_mountain`, `whisky_peak`, `little_garden`, `drum`, `alabasta`.
- Seas : `sea_east_blue`, `sea_paradise`, `sea_new_world`.

Ajouter une nouvelle zone = pousser dans le bon array TS + générer la migration. Pas de `ALTER TYPE` à écrire à la main.

## Le graphe des arêtes

**Pas en base de données.** Le graphe est une constante TypeScript dans `apps/bot/src/domains/navigation/world.ts` (cf [world.md](./world.md) §"Comment tout ce monde est représenté en code").

Pourquoi en code et pas en base :

- La liste change rarement (= en même temps que le code).
- Pas de lecture en hot path qui bénéficierait d'un index.
- C'est très naturellement versionnable avec git.
- On peut facilement écrire des tests qui valident le graphe (pas de cycle, pas d'arête vers une zone inexistante, etc.).

## Comment la position est mise à jour pendant un voyage

La position courante du joueur vit sur `player.current_zone` (cf domaine `player`). À chaque étape du voyage, on l'update et on trace dans `history`, dans la même transaction :

**Au départ (île → mer) :**

1. `UPDATE player SET current_zone = 'sea_paradise' WHERE id = ?`
2. `INSERT history (event_type, actor_player_id, payload) VALUES ('player.zone_changed', ?, { from: 'reverse_mountain', to: 'sea_paradise' })`
3. - UPDATE des colonnes `travel_*` (cf section précédente)

**À l'arrivée (mer → île) :**

Pareil, en remettant `current_zone` à la zone d'arrivée et en vidant les colonnes `travel_*`.

`current_zone` est la **source de vérité de "où est le joueur en ce moment"**. Les colonnes `travel_*` sont des **infos additionnelles** sur le voyage en cours quand `current_zone` est une mer.

## Trace dans `history`

Chaque grand moment du voyage est tracé dans `history` :

| `event_type`      | Quand                                             | `payload`                                        |
| ----------------- | ------------------------------------------------- | ------------------------------------------------ |
| `travel.departed` | Au moment où le joueur quitte une île             | `{ from, to, viaSea, estimatedDurationBuckets }` |
| `travel.arrived`  | Quand le joueur arrive à destination              | `{ from, to, actualDurationBuckets }`            |
| `travel.drifted`  | Quand il a dérivé et arrive ailleurs que prévu    | `{ from, intendedTo, actualTo }`                 |
| `travel.rerouted` | Quand il change de destination en cours de voyage | `{ from, originalTo, newTo }`                    |

Ces traces servent à débloquer des conditions futures (ex: "a déjà visité Drum") ou simplement à reconstruire l'historique de voyage du joueur.
