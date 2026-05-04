# Domaine : ship

## Concept

Chaque joueur possède **un navire**, et un navire appartient à **un seul joueur**. La relation est 1-1 et définitive — pas de swap Merry → Sunny, toute la progression passe par l'amélioration du navire existant.

Le navire est créé automatiquement à la première opération qui en a besoin (`findOrCreateShip`). Il porte un **nom** : choisi par le joueur s'il en fournit un, sinon `Navire sans nom` par défaut.

## Modules

Le navire est composé de **5 modules**, chacun rattaché à une partie du bateau. C'est la seule chose qu'on persiste : un **niveau** par module (1 à 5). Tout le reste (PV max, vitesse, capacités…) est **dérivé** du niveau via la table de constantes `SHIP_MODULES` (`apps/bot/src/domains/ship/modules.ts`).

| Module   | Partie du bateau | Colonne DB     | Effet (valeur dérivée du niveau)                        |
| -------- | ---------------- | -------------- | ------------------------------------------------------- |
| `hull`   | Coque            | `hull_level`   | Points de vie maximum du navire                         |
| `sail`   | Voile            | `sail_level`   | Réduit le temps entre deux events (voir `event`)        |
| `decks`  | Ponts            | `decks_level`  | Nombre de personnages **actifs** (voir `crew`)          |
| `cabins` | Chambres         | `cabins_level` | Nombre de personnages en **réserve** (voir `character`) |
| `cargo`  | Cale             | `cargo_level`  | Capacité d'objets `CRAFT` stockables (voir `resource`)  |

> La valeur effective d'un module au niveau N s'obtient via `SHIP_MODULES[<module>].valueByLevel[N - 1]`. Exemple : `SHIP_MODULES.decks.valueByLevel[0] === 3` → un navire neuf peut embarquer 3 personnages actifs.

## Santé (`hp`) vs PV max

Deux notions distinctes :

- **PV max** — plafond, dérivé du niveau de Coque (`SHIP_MODULES.hull.valueByLevel`). Monte uniquement via amélioration du module `hull`.
- `hp` — santé actuelle, persistée en colonne, bornée par les PV max. Baisse lorsque le navire encaisse des dégâts (monstre marin, combat naval, event hostile) et remonte via **réparation**.

<!-- TODO: définir la mécanique de réparation (régénération passive ? coût en Berry / ressources ? réparation via event ?). -->

## Améliorations

Chaque module peut être amélioré indépendamment, du niveau 1 au niveau 5. Monter un niveau coûte une combinaison définie dans `SHIP_MODULES[<module>].costByLevel` :

- **ressources** (bois, fer, tissu… voir `resource`),
- **et/ou** Berry (voir `economy`),
- **et/ou** présence d'un personnage spécial dans l'équipage (ex: un charpentier type Franky pour améliorer la Coque),
- **et/ou** une ability particulière,
- **ou** déclenché par un event (ex: rencontre avec un charpentier légendaire qui améliore gratuitement un module — voir `event`).

Améliorer un module fait monter sa valeur dérivée — améliorer `sail` augmente la vitesse, améliorer `cargo` augmente la capacité de la cale, etc.
