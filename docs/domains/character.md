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

- **Chaque joueur a son propre `character_template`**, créé en même temps que le player (dans la même transaction). Ce template porte une colonne `player_id` qui pointe vers le joueur ; c'est ce marqueur qui le distingue d'un template recrutable (et qui sert à le retrouver). Il n'y a plus de template système partagé `PLAYER_AS_CHARACTER`. Stats de base : 10 hp / 10 combat, race `HUMAN`, pas d'image. Comme c'est son propre template, le joueur peut désormais faire évoluer son perso, lui faire manger un Fruit du Démon, gagner ses propres stats/skills sans toucher aux autres joueurs.
- Ces templates perso ne sont **pas recrutables** — `searchManyByName` exclut toute ligne où `player_id IS NOT NULL`. Leur colonne `name` est `NULL` (les noms de joueurs ne sont pas uniques, et `character_template.name` est `unique`) ; c'est le `nickname` de l'instance qui porte le nom affiché.
- L'instance porte un `nickname` qui prend le dessus sur le `name` du template à l'affichage. Par défaut, c'est le nom du joueur ; quand le joueur se rename, le nickname suit.
- Elle est créée avec `isCaptain = true` et `joinedCrewAt = now()` — au début, le joueur est seul, donc captain par défaut.
- Elle **n'est pas figée captain** : elle peut être destituée, mise en réserve, etc., comme n'importe quel `character_instance`. Pour la retrouver on passe par le template du joueur (`character_template.player_id = <playerId>`), jamais par `isCaptain`.

Helper d'affichage : `getCharacterInstanceName(row)` retourne `nickname ?? template.name` — utilisé partout où on affiche un perso. Pour le perso-joueur, `template.name` est `NULL`, donc le `nickname` est toujours utilisé.

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
