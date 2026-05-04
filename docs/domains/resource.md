# Domaine : resource

## Concept

Les **ressources** regroupent tous les objets que le joueur amasse et qui ne sont pas un personnage. Trois natures cohabitent dans un inventaire logique unique, avec des règles de stockage distinctes.

## Vocabulaire

- **Resource** — un objet possédé (instance d'une `resource_template`), avec une quantité.
- **Inventory** — l'ensemble des resources d'un joueur, vu comme un tout. C'est une **vue dérivée** (jointure `resource_instance` × `resource_template`), pas une table en base. Le code expose ce concept via `getInventory(playerId)` dans `resource/repository.ts`.
- **InventoryItem** — une entrée de l'inventaire (`{ name, quantity }`).

## Les trois types

### `CRAFT` — matériaux d'amélioration

Consommables utilisés pour améliorer les modules du navire (voir `ship`).

Exemples : bois, fer, tissu.

Sources : butin d'events, quêtes, achat chez les marchands (voir `economy`).

### `STORY` — artefacts de main story

Objets rares liés à la progression scénario.

Exemples : Poneglyphs, armes antiques, fragments de carte au trésor.

- **Non consommables** — ils restent acquis indéfiniment.
- **Invendables** — aucun marchand ne les rachète.
- Obtenus uniquement via events `main_story` ou `side_quest` (voir `event`).

### `DEVIL_FRUIT` — Fruits du Démon non consommés

Tant qu'un FDD n'a pas été mangé, il fait partie des possessions du joueur. Conceptuellement c'est une "ressource" comme les autres, mais **techniquement il vit dans une table dédiée** `devil_fruit_instance` (pas dans `resource_instance`) — l'unicité par fruit et le lien éventuel vers le personnage porteur justifient un schéma propre. Voir `devil_fruit`.

Deux usages exclusifs :

- **Consommé** par un personnage qui n'en porte aucun — action définitive qui lie le fruit au personnage (voir `devil_fruit`).
- **Revendu** à un marchand (voir `economy`).

## Stockage

| Type          | Table                  | Compte dans la capacité de la cale ? |
| ------------- | ---------------------- | ------------------------------------ |
| `CRAFT`       | `resource_instance`    | Oui                                  |
| `STORY`       | `resource_instance`    | Non — inventaire à part              |
| `DEVIL_FRUIT` | `devil_fruit_instance` | Non — inventaire à part              |

Les matériaux `CRAFT` sont stockés dans la **cale** du navire — la capacité est dérivée du niveau du module `cargo` (voir `ship`). Quand la cale est pleine, le joueur ne peut plus ramasser de matériau tant qu'il n'a pas consommé ou crafté avec.

Les `STORY` et `DEVIL_FRUIT` sont conservés à part, sans limite (l'unicité propre aux FDD plafonne déjà naturellement leur volume).
