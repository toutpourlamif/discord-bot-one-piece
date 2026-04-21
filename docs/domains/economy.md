# Domaine : economy

## Concept

L'**économie** couvre tout ce qui tourne autour du **Berry**, la monnaie du jeu, et des échanges marchands.

## Berry

Le Berry est la monnaie unique. Le joueur en gagne :

- via les events (récompenses, butin, coffres…),
- via les combats,
- via les quêtes,
- en **revendant des items** à un marchand (Fruits du Démon non consommés, ressources de craft, esclaves…). Les artefacts de main story sont invendables (voir `resource`).

Il en dépense dans les **shops**.

## Shops et marchands

Les achats se font auprès de **marchands**. Plusieurs formes possibles :

- **navire marchand** croisé en mer (événement `recurring`),
- **marchands d'île** rencontrés en `main_story`,
- marchands spéciaux débloqués par `side_quest`.

Un marchand propose un **stock limité** d'items : Fruits du Démon, améliorations de navire, nourriture, consommables…

## Catalogue d'items

L'economy ne possède pas les FDD (voir `devil_fruit`), les modules de navire (voir `ship`), ni les ressources (voir `resource`) — elle sert de **passerelle d'achat** vers ces domaines. Les items propres à l'economy sont les consommables, la nourriture, et tout objet générique qui ne mérite pas son propre domaine.
