# Le monde et le graphe de zones

## Vue d'ensemble

Le monde de One Piece est immense, mais on ne le code pas en une fois. La V1 démarre **petit** : juste de quoi faire un parcours de mainstory plausible (Foosha → Reverse Mountain → Paradise → Alabasta). On ajoutera des zones au fur et à mesure.

Voici le plan général canonique de l'univers, pour avoir l'image en tête :

```
East Blue ──┐
            │
West Blue ──┼─→ Reverse Mountain ─→ Paradise (1ère moitié du Grand Line)
            │                              │
North Blue ─┤                              ↓
            │                       Fishman Island
South Blue ─┘                              │
                                           ↓
                                     New World (2ème moitié)
```

> Pour l'instant on n'a que des îles d'**East Blue** parmi les Blue. On ajoutera les autres plus tard.

## Catalogue des zones de la V1

### Islands (les zones terrestres)

| Island             | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `foosha`           | Le village natal de Luffy. Point de départ de tous les nouveaux joueurs.    |
| `loguetown`        | La dernière île d'East Blue avant le Grand Line. Lieu d'exécution de Roger. |
| `reverse_mountain` | La porte d'entrée du Grand Line. Une montagne avec un courant qui monte.    |
| `whisky_peak`      | Première île du Grand Line. Un piège à pirates, pleine d'agents secrets.    |
| `little_garden`    | Une île préhistorique, dinosaures, géants. Détour de la mainstory.          |
| `drum`             | Île hivernale, un médecin légendaire. C'est là qu'on recrute Chopper.       |
| `alabasta`         | Royaume désertique. Combat contre Crocodile, c'est le climax de l'arc 1.    |

### Seas (les zones de mer entre les îles)

| Sea             | Quand on y est                                              |
| --------------- | ----------------------------------------------------------- |
| `sea_east_blue` | Pendant qu'on navigue entre les îles d'East Blue.           |
| `sea_paradise`  | Pendant qu'on navigue dans la 1ère moitié du Grand Line.    |
| `sea_new_world` | Déclaré pour le futur. Aucune île atteignable encore en V1. |

> **Vocabulaire** : on appelle ces deux familles `Island` et `Sea`. Le terme générique qui désigne l'une ou l'autre, c'est `Zone` (= `Island | Sea`).

> **Pourquoi 3 sea\_ et pas une seule ?** Parce que deux joueurs en mer dans des régions complètement différentes (un qui quitte Wano, un qui quitte East Blue) ne devraient pas se rencontrer. Avec 3 mers, on évite ces rencontres absurdes — un joueur en `sea_east_blue` ne croise pas un joueur en `sea_paradise`.

## Le graphe d'arêtes (qui mène à qui)

```
foosha ──→ loguetown ──→ reverse_mountain ──→ whisky_peak ──→ little_garden ──→ drum ──→ alabasta
```

C'est volontairement linéaire pour la V1. Un seul chemin possible, on suit le rail. À mesure qu'on rajoute des îles (Jaya, Skypiea, Water 7…), le graphe va se ramifier.

## Le Log Pose

Dans le manga, dès qu'on entre dans le Grand Line, **les boussoles classiques ne marchent plus** (les champs magnétiques sont chaotiques). Il faut un **Log Pose** : une boussole spéciale qui se "verrouille" sur la prochaine île à atteindre. Tu navigues à l'aveugle, mais tu suis l'aiguille.

Concrètement dans le jeu :

- Sans Log Pose, tu ne peux pas voyager dans Paradise. Tu es bloqué.
- Avec un Log Pose, **tu n'as qu'une seule destination possible depuis chaque île** : la prochaine de la chaîne. Whisky Peak → Little Garden → Drum → Alabasta → … (etc.).
- Le Log Pose se met à jour tout seul à chaque arrivée. C'est un item permanent de l'inventaire.

> **Pourquoi cette restriction ?** C'est plus narratif et plus fidèle. Si on laissait le joueur choisir librement n'importe quelle île dans Paradise, on perdrait toute la sensation de "périple" et l'Eternal Pose deviendrait inutile.

## L'Eternal Pose

Un **Eternal Pose** est verrouillé pour toujours sur **une île précise**. Tant que tu l'as dans ton inventaire, tu peux mettre le cap sur cette île **depuis n'importe où dans la même région**.

Concrètement :

- Tu es à Whisky Peak. Tu as un Eternal Pose Drum dans l'inventaire. → Tu peux skipper Little Garden et aller direct à Drum.
- Tu es à Alabasta. Tu as un Eternal Pose Drum. → Tu peux y revenir librement.

Les Eternal Pose sont des **récompenses rares** : on en trouve via des événements spécifiques, on en achète chez certains marchands, on en gagne en boss fight, etc. C'est **précieux**.

> **Comment on évite que ça casse la mainstory ?** Parce que les chapitres mainstory s'activent **quand tu arrives sur l'île concernée** (event `oneTime`). Tu peux skipper Drum, mais le jour où tu y reviens (via Eternal Pose ou via le rail naturel après un retour en arrière), le chapitre s'enclenche enfin. Skipper ne te bloque pas, ça retarde juste.

## Comment tout ce monde est représenté en code

### Single source of truth : deux arrays TypeScript

La liste des zones est définie **une seule fois**, dans `packages/db/src/domains/.../zones.ts` :

- `ISLANDS` : array TS des îles.
- `SEAS` : array TS des mers.
- `ZONES = [...ISLANDS, ...SEAS]` : la concaténation, utilisée pour générer l'enum Postgres.

L'enum Drizzle `zoneEnum` est dérivé directement de `ZONES`. Donc ajouter une nouvelle zone se fait à un seul endroit (le bon array), et la migration de l'enum + les types TS suivent automatiquement.

Les types TS exposés :

- `type Island = (typeof ISLANDS)[number]`
- `type Sea = (typeof SEAS)[number]`
- `type Zone = (typeof ZONES)[number]` (= `Island | Sea`)

### Le graphe en lui-même reste en TypeScript

Pas de table SQL pour le graphe (les arêtes, les durées, les conditions par route) — c'est une constante TypeScript déclarée en dur dans `apps/bot/src/domains/navigation/world.ts`. Il ne change pas au runtime, c'est plus simple à versionner et à tester.

### À retenir

- `Island` = une île (Foosha, Drum, Alabasta…).
- `Sea` = une mer (`sea_east_blue`, `sea_paradise`, `sea_new_world`).
- `Zone = Island | Sea` = l'umbrella, utilisé partout où on s'en fiche.
- Les arêtes du graphe (`from`/`to`) sont toujours des `Island`. Le `via` (la mer traversée) est toujours une `Sea`. On ne voyage pas DEPUIS ou VERS une mer — la mer est juste un transit.

Les types `TravelCondition` et `TravelModifier` sont décrits dans [travel-mechanics.md](./travel-mechanics.md).
