# Domaine : navigation

## L'idée en deux phrases

Le joueur ne tape pas `!naviguer drum` pour changer de zone. À la place, **les événements de l'île où il se trouve** lui proposent de partir, et c'est lui qui choisit où aller. Une fois en mer, il vit la traversée à travers d'autres événements jusqu'à arriver à destination.

C'est comme dans le manga : Luffy ne décide pas "tiens je vais à Drum" au hasard, c'est l'histoire qui l'y emmène (Nami est malade, il faut un médecin).

## Pourquoi cette approche

- **Plus narratif.** Chaque départ a une raison.
- **Pas de menu géant** où on choisit parmi 30 destinations.
- **Cohérent avec le reste du bot** : tout passe par `!recap`, jamais par des commandes "actives".

## Plan de la doc

| Fichier                                      | Ce que tu y trouves                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| [concepts.md](./concepts.md)                 | Les états du joueur, comment on part, comment on arrive                 |
| [world.md](./world.md)                       | Le graphe des zones, le Log Pose, l'Eternal Pose                        |
| [travel-mechanics.md](./travel-mechanics.md) | Combien de temps dure un trajet, ce qui le rend plus rapide, les échecs |
| [data-model.md](./data-model.md)             | Les colonnes ajoutées à `player`, les nouveaux items                    |

## Ce que ça suppose côté autres domaines

- Le domaine [event](../event/README.md) doit exister (les départs et les arrivées sont des événements interactifs).
- Le domaine `inventory` doit gérer les items spéciaux : Log Pose, Eternal Pose.
- Le domaine `character` doit avoir une notion de **classe** (un personnage est `navigator`, `cook`, `doctor`…) et un **niveau**.
- Le domaine `ship` doit exposer une vitesse de base (`shipFactor`).
