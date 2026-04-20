# Domaine : crew

## Concept

L'**équipage** représente les personnages **actifs** du joueur, ceux qui sont embarqués sur le navire et qui participent aux events et combats.

C'est un sous-ensemble de la **réserve** (voir domaine `character`).

## Taille de l'équipage

Le nombre de places à bord est **limité par le navire** (voir domaine `ship`). Un bateau de départ n'offrira que quelques places ; les navires plus avancés en offrent davantage.

## Rôle dans le jeu

L'équipage détermine :

- quels personnages peuvent déclencher un `side_quest` (ex: avoir Zoro actif pour déclencher la rencontre avec Mihawk),
- la **force d'équipage** (somme ou combinaison des stats), utilisée comme prérequis pour certains events,
- qui peut évoluer via les events.

## Composer son équipage

Le joueur arbitre entre ses personnages en réserve pour choisir qui embarquer. Ce choix est stratégique : un personnage laissé en réserve ne participe à rien.

## Moral

L'équipage porte un **moral** collectif — un attribut au niveau du crew, pas par personnage.

**Effets** :

- débloque ou verrouille certains events (un équipage au moral bas ne tente pas de s'aventurer sur une île)
- **prévient la mutinerie** — en dessous d'un seuil, un personnage peut quitter l'équipage,
- facilite la **persuasion** de personnages pour qu'ils rejoignent l'équipage. (Shanks veut rejoindre un équipage qui sait s'amuser)

**Sources de variation** :

- objets consommables (ex: alcool, festin — voir `resource` et `economy`),
- events (victoires éclatantes → +moral ; défaites, trahisons → −moral),
