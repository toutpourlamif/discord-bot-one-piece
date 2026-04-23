# Domaine : ship

## Concept

Chaque joueur possède **un navire**, et un navire appartient à **un seul joueur**. La relation est 1-1 et définitive — pas de swap Merry → Sunny, toute la progression passe par l'amélioration du navire existant.

Le navire est créé automatiquement à la première opération qui en a besoin (`findOrCreateShip`). Il porte un **nom** choisi par le joueur (pas de nom par défaut).

## Attributs

Cinq attributs définissent ce que le joueur peut faire. Chacun est rattaché à une **partie du bateau** — c'est cette partie qu'on améliore pour monter l'attribut.

| Attribut      | Partie du bateau | Nom technique | Effet                                                   |
| ------------- | ---------------- | ------------- | ------------------------------------------------------- |
| `maxHp`       | Coque            | `hull`        | Points de vie maximum du navire                         |
| `speed`       | Voile            | `sail`        | Réduit le temps entre deux events (voir `event`)        |
| `crewSize`    | Ponts            | `decks`       | Nombre de personnages **actifs** (voir `crew`)          |
| `reserveSize` | Chambres         | `cabins`      | Nombre de personnages en **réserve** (voir `character`) |
| `storageSize` | Cale             | `cargo`       | Capacité d'objets stockables (voir `resource`)          |

> Le **nom technique** est celui utilisé partout dans le code (types, colonnes DB, clés de constantes) : `hullLevel`, `MODULE_BONUS_BY_LEVEL.sail`, `decksLevel`, etc.

## Santé (`hp`) vs `maxHp`

Deux champs distincts :

- `maxHp` — plafond, monte uniquement via amélioration de la Coque.
- `hp` — santé actuelle, bornée par `maxHp`. Baisse lorsque le navire encaisse des dégâts (monstre marin, combat naval, event hostile) et remonte via **réparation**.

<!-- TODO: définir la mécanique de réparation (régénération passive ? coût en Berry / ressources ? réparation via event ?). -->

## Améliorations (modules)

Chaque partie du bateau peut être améliorée indépendamment par **niveaux**. Monter un niveau coûte une combinaison au choix du game design :

- **ressources** (bois, fer, tissu… voir `resource`),
- **et/ou** Berry (voir `economy`),
- **et/ou** présence d'un personnage spécial dans l'équipage (ex: un charpentier type Franky pour améliorer la Coque),
- **et/ou** une ability particulière,
- **ou** déclenché par un event (ex: rencontre avec un charpentier légendaire qui améliore gratuitement un module — voir `event`).

Améliorer une partie fait monter l'attribut qu'elle gouverne — améliorer la Voile augmente `speed`, améliorer la Cale augmente `storageSize`, etc.
