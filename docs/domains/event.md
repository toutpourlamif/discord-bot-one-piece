# Domaine : event

## Qu'est-ce qu'un event ?

Un **événement** est quelque chose qui arrive au joueur pendant qu'il est **AFK**. Il le découvre en lançant la commande `/récap` : celle-ci raconte ce qui s'est passé depuis la dernière consultation.

Un event n'est donc **jamais déclenché à la demande** par le joueur — il est tiré au moment du récap selon des règles de fréquence et de prérequis.

## Les 4 catégories

| Catégorie    | Fréquence    | Exemples                                                                                |
| ------------ | ------------ | --------------------------------------------------------------------------------------- |
| `recurring`  | Fréquent     | Attaque de monstre marin, vague qui secoue la coque, baril à la dérive, navire marchand |
| `one_time`   | Très rare    | Bateau fantôme, rencontre avec un personnage légendaire                                 |
| `main_story` | Scénarisé    | Visite d'une île principale, info sur le One Piece, fragment d'arme antique             |
| `side_quest` | Conditionnel | Rencontre avec Mihawk (fait évoluer Zoro si les bons choix sont faits)                  |

## Prérequis

Un event peut définir des conditions d'apparition :

- avoir tel personnage dans l'équipage,
- force d'équipage ≥ X,
- posséder tel objet,
- avoir atteint telle étape du scénario.

Les `side_quest` sont particulièrement conditionnées : une rencontre avec Mihawk n'a de sens que si Zoro est embarqué.

## Règles

- Un `one_time` ne se joue **qu'une seule fois par joueur**.
- Les `main_story` suivent un **ordre fixe** — on ne débloque pas Skypiea avant Alabasta.
- Un event peut produire des **effets** : gain de Berry, drop d'objet, évolution de personnage, avancée scénario.
