# Domaine : character

## Concept

Un **personnage** est une entité unique avec ses propres stats. Chaque **stade d'évolution** est un personnage distinct :

```
Luffy adolescent  ≠  Luffy Gear 1  ≠  Luffy Gear 2  ≠  Luffy Gear 5
```

Ce sont 4 personnages différents dans la base, reliés par un arbre d'évolution.

## PlayerAsCharacter

Le **PlayerAsCharacter** est le personnage qui matérialise le joueur lui-même dans le monde. C'est un `character_instance` comme les autres — il est dans la réserve, dans l'équipage, mange un Fruit du Démon, gagne des stats, exactement comme n'importe quel personnage. Toute feature ajoutée aux personnages s'applique automatiquement au PlayerAsCharacter, sans duplication.

Concrètement :

- Il pointe vers un `character_template` système nommé `PLAYER_AS_CHARACTER` (constante `PLAYER_AS_CHARACTER_TEMPLATE_NAME`). Ce template n'est **pas recrutable** — il est exclu des recherches (`searchManyByName`).
- Il porte un `nickname` qui prend le dessus sur le `name` du template à l'affichage. Par défaut, c'est le nom du joueur ; quand le joueur se rename, le nickname suit.
- Il est créé en même temps que le player (dans la même transaction), avec `isCaptain = true` et `joinedCrewAt = now()` — au début, il est seul, donc captain par défaut.
- Il **n'est pas figé captain** : il peut être destitué, mis en réserve, etc., comme n'importe quel `character_instance`. Pour le retrouver on filtre sur `templateId = PLAYER_AS_CHARACTER`, jamais sur `isCaptain`.

Helper d'affichage : `getCharacterInstanceName(row)` retourne `nickname ?? template.name` — utilisé partout où on affiche un perso.

## Arbre d'évolution

Chaque personnage a une propriété `nextEvolution` qui pointe vers le stade suivant (ou `null` s'il n'évolue plus).

Seul le **premier stade** est obtenable directement (drop d'event, récompense, etc.). Les stades suivants ne s'obtiennent **que par évolution** — on ne peut pas drop un Gear 2 d'un coup.

## Déclencheurs d'évolution

Trois manières de faire évoluer un personnage :

- un **`side_quest` réussi** (ex: Zoro rencontre Mihawk et fait les bons choix),
- la **consommation d'un objet** (ex: un Fruit du Démon, un artefact),
- un **event spécial** qui transforme le personnage (ex: rencontre avec Kuma qui propulse un membre de l'équipage et le renvoie plus fort plus tard).

L'évolution remplace l'instance du personnage par celle désignée par `nextEvolution`.

## Réserve vs équipage

Le joueur stocke ses personnages dans sa **réserve**. La taille de la réserve est **limitée et dépend du navire** (voir domaine `ship`) — un navire plus grand permet d'en garder plus à bord.

Seul un sous-ensemble est **actif** (prend part aux events, combats) — ça, c'est la responsabilité du domaine Équipage (`crew`). Les autres personnages attendent dans la réserve.
