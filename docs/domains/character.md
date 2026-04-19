# Domaine : character

## Concept

Un **personnage** est une entité unique avec ses propres stats. Chaque **stade d'évolution** est un personnage distinct :

```
Luffy adolescent  ≠  Luffy Gear 1  ≠  Luffy Gear 2  ≠  Luffy Gear 5
```

Ce sont 4 personnages différents dans la base, reliés par un arbre d'évolution.

## Arbre d'évolution

Chaque personnage a une propriété `nextEvolution` qui pointe vers le stade suivant (ou `null` s'il n'évolue plus).

Seul le **premier stade** est obtenable directement (drop d'event, récompense, etc.). Les stades suivants ne s'obtiennent **que par évolution** — on ne peut pas drop un Gear 2 d'un coup.

## Déclencheurs d'évolution

Deux manières de faire évoluer un personnage :

- un **`side_quest` réussi** (ex: Zoro rencontre Mihawk et fait les bons choix),
- la **consommation d'un objet** (ex: un Fruit du Démon, un artefact).

L'évolution remplace l'instance du personnage par celle désignée par `nextEvolution`.

## Réserve vs équipage

Le joueur stocke ses personnages dans sa **réserve**. La taille de la réserve est **limitée et dépend du navire** (voir domaine `ship`) — un navire plus grand permet d'en garder plus à bord.

Seul un sous-ensemble est **actif** (prend part aux events, combats) — ça, c'est la responsabilité du domaine Équipage (`crew`). Les autres personnages attendent dans la réserve.
