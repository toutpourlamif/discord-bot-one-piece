# Domaine : resource

## Concept

Les **ressources** regroupent tous les objets que le joueur amasse et qui ne sont pas un personnage. Trois natures cohabitent dans un inventaire logique unique, avec des règles de stockage distinctes.

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

Tant qu'un FDD n'a pas été mangé, il vit dans l'inventaire du joueur. Deux usages exclusifs :

- **Consommé** par un personnage qui n'en porte aucun — action définitive qui lie le fruit au personnage (voir `devil_fruit`).
- **Revendu** à un marchand (voir `economy`).

Les règles d'unicité, d'obtention et d'effets post-consommation sont documentées dans `devil_fruit`.

## Stockage

| Type          | Compte dans `storageSize` ? |
| ------------- | --------------------------- |
| `CRAFT`       | Oui (cale)                  |
| `STORY`       | Non — inventaire à part     |
| `DEVIL_FRUIT` | Non — inventaire à part     |

Les matériaux `CRAFT` sont stockés dans la **cale** du navire — la capacité est fixée par l'attribut `storageSize` (voir `ship`). Quand la cale est pleine, le joueur ne peut plus ramasser de matériau tant qu'il n'a pas consommé ou crafté avec.

Les `STORY` et `DEVIL_FRUIT` sont conservés à part, sans limite (l'unicité propre aux FDD plafonne déjà naturellement leur volume).
