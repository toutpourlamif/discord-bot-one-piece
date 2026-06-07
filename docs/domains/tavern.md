# Domaine : tavern

## Concept

La **taverne** est un endroit important d'une île. Le joueur l'ouvre via `!tavern` (ou `!taverne`) quand il est **à quai** sur une île qui en possède une. C'est le point d'entrée vers les activités proposées sur place : jouer à des mini jeux, acheter des items, déclencher des quêtes, recruter des persos.

## Localisation

Une taverne est **liée à l'île courante** du joueur (`player.currentZone`)

- En mer : pas de taverne, le joueur doit revenir à quai.
- Sur une île sans taverne déclarée : message « Pas de taverne ici ».

Les tavernes sont déclarées au niveau de chaque île dans le registry de `packages/db` (`TAVERN_BY_ZONE`).
Quand on déclare une île (voir fonction `defineIsland`) on peut lui passer une clé `tavern` ; si `island.tavern` est `undefined`, l'île n'a tout simplement pas de taverne.

## Sections

Le menu liste des **sections**, dérivées des `activities` de la `TavernConfig` de l'île :

| Section        | Présence                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------- |
| 🍺 Tavernier   | Toujours présente                                                                                 |
| 🛒 Boutique    | Si l'activité `shop` est déclarée                                                                 |
| ⚓ Recruter    | Si l'activité `recruit` est déclarée                                                              |
| 🎲 Espace jeux | Si l'activité `blackjack` **ou** `juste-prix` est déclarée (un seul bouton qui regroupe les jeux) |

## État actuel

Tout est **stub** : le menu et les boutons de section s'affichent, mais chaque section répond « 🔜 Bientôt disponible ». La logique métier de chaque activité (boutique, recrutement, jeux) sera implémentée au fur et à mesure.
