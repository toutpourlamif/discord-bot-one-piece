# Modèle de données

Ce que la navigation ajoute à la base de données.

## Nouvelles colonnes sur `player`

Trois colonnes pour suivre l'état de voyage du joueur :

| Colonne              | Type             | Quand c'est rempli                                                |
| -------------------- | ---------------- | ----------------------------------------------------------------- |
| `travel_target_zone` | text NULL        | Si le joueur est en mer : l'île qu'il vise. NULL s'il est ancré.  |
| `travel_started_at`  | timestamptz NULL | Le moment où il a quitté son île précédente. NULL s'il est ancré. |
| `travel_eta_at`      | timestamptz NULL | Le moment où il devrait arriver. NULL s'il est ancré.             |

Quand le joueur **part**, les trois colonnes se remplissent.
Quand il **arrive** (ou qu'il **dérive**), les trois colonnes se vident.
Quand il **change de cap pendant le trajet**, on garde `travel_started_at` mais on met à jour `travel_target_zone` et `travel_eta_at`.

> **Pourquoi sur `player` et pas dans `event_instance.state` ?** Parce que ces infos sont **lues très souvent** : à chaque `!recap`, à chaque `!profil`, dans le `ctx` des générateurs en mer. Trois colonnes scalaires sont infiniment plus rapides à lire qu'un champ JSON. Et c'est conceptuellement simple : "où en est le joueur dans son voyage" est un état du joueur.

## Nouveaux items dans l'inventaire

On suit le pattern existant du projet : chaque type d'item est **une ligne dans `resource_template`** identifiée par son `name`. On lookup par nom (`ctx.inventory.has('Log Pose')`).

### Le Log Pose

Une seule ligne `resource_template` :

| name     |
| -------- |
| Log Pose |

Le joueur en possède au plus un exemplaire à la fois. C'est le passe-droit pour naviguer dans le Grand Line.

- Obtenu typiquement à Reverse Mountain ou comme récompense d'un event mainstory du début du Grand Line.
- Peut être **perdu** lors d'un combat ou d'un naufrage.
- Peut être **acheté** chez certains marchands.

### Les Eternal Poses

**Une ligne `resource_template` par île pose-able**. Le nom encode la destination :

| name                   |
| ---------------------- |
| Eternal Pose - Drum    |
| Eternal Pose - Skypiea |
| Eternal Pose - Water 7 |
| ...                    |

Un joueur peut en posséder plusieurs, mais un seul exemplaire de chaque. Chacun est verrouillé sur l'île écrite dans son nom.

- Obtenu généralement comme récompense rare d'un event spécifique à une île.
- Permanent (ne se perd pas en combat, mais peut être volé via certains events).

> **Pourquoi une ligne par île et pas une ligne unique "Eternal Pose" avec un paramètre ?** Parce qu'on suit le pattern du projet (`resource_template` est identifié par `name`, sans paramètre). Ajouter un système paramétrique juste pour les Eternal Poses serait une exception qui complexifierait pour rien. Si un jour on a 30 destinations différentes et que ça devient lourd, on pourra refactoriser.

### Côté code

Les noms exacts vivent dans la même `RESOURCE_TEMPLATES_DATA` que les autres ressources (`packages/db/src/domains/resource/resource_template/data.ts`), et la liste des Eternal Poses doit rester synchronisée avec la liste des zones du graphe. Idéalement un test au boot vérifie que pour chaque île traversable via Eternal Pose, la ligne `resource_template` existe.

## L'enum des zones

Tous les noms de zones (terrestres et sous-mers) vivent dans **un même enum Postgres**. C'est ce qu'utilisent `zone_presence.zone` et `player.travel_target_zone`.

V1 :

```
zone_enum = (
  'east_blue',
  'reverse_mountain',
  'whisky_peak',
  'little_garden',
  'drum',
  'alabasta',
  'at_sea_east_blue',
  'at_sea_paradise',
  'at_sea_new_world'
)
```

À chaque fois qu'on ajoute une nouvelle île, c'est une migration `ALTER TYPE zone_enum ADD VALUE 'new_island'`.

> **Pourquoi un enum et pas une table `zones` ?** Parce que la liste est petite, change rarement, et on en a besoin partout en TS. Avec un enum on garde la liste synchronisée entre TS et Postgres, et on a la complétion automatique. Une table serait sur-dimensionnée pour ce besoin.

## Le graphe des arêtes

**Pas en base de données.** Le graphe est une constante TypeScript dans `apps/bot/src/domains/navigation/world.ts` (cf [world.md](./world.md) §"Comment tout ce monde est représenté en code").

Pourquoi en code et pas en base :

- La liste change rarement (= en même temps que le code).
- Pas de lecture en hot path qui bénéficierait d'un index.
- C'est très naturellement versionnable avec git.
- On peut facilement écrire des tests qui valident le graphe (pas de cycle, pas d'arête vers une zone inexistante, etc.).

## Comment ça s'articule avec `zone_presence`

`zone_presence` (créée dans le domaine event) ne change pas. Quand le joueur passe d'une île à une sous-mer, c'est un changement de zone normal :

1. `UPDATE zone_presence SET left_at = now() WHERE player_id = ? AND left_at IS NULL`
2. `INSERT zone_presence (player_id, zone, entered_at, left_at) VALUES (?, 'at_sea_paradise', now(), NULL)`

Pareil quand on arrive à destination :

1. `UPDATE zone_presence SET left_at = now() WHERE player_id = ? AND left_at IS NULL`
2. `INSERT zone_presence (player_id, zone, entered_at, left_at) VALUES (?, 'drum', now(), NULL)`

Donc `zone_presence` reste la **source de vérité de "où est le joueur en ce moment"**. Les colonnes `travel_*` sont juste des **infos additionnelles** sur le voyage en cours quand la zone est une sous-mer.

## Trace dans `history`

Chaque grand moment du voyage est tracé dans `history` :

| `event_type`      | Quand                                             | `payload`                                        |
| ----------------- | ------------------------------------------------- | ------------------------------------------------ |
| `travel.departed` | Au moment où le joueur quitte une île             | `{ from, to, viaSea, estimatedDurationBuckets }` |
| `travel.arrived`  | Quand le joueur arrive à destination              | `{ from, to, actualDurationBuckets }`            |
| `travel.drifted`  | Quand il a dérivé et arrive ailleurs que prévu    | `{ from, intendedTo, actualTo }`                 |
| `travel.rerouted` | Quand il change de destination en cours de voyage | `{ from, originalTo, newTo }`                    |

Ces traces servent à débloquer des conditions futures (ex: "a déjà visité Drum") ou simplement à reconstruire l'historique de voyage du joueur.
