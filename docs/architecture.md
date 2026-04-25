# Architecture

## Vue d'ensemble

Le bot est structuré autour de **domaines métier** purs. La couche **`discord`** est un adaptateur : elle traduit les entrées Discord (slash commands, boutons, selects) en appels aux domaines, et formate les résultats en messages/embeds.

```
Discord UI  ──>  discord (adapter)  ──>  domains (logique métier)  ──>  persistence
```

## Domaines actuels

On ouvre un domaine (dossier + doc) uniquement au moment où on commence à coder dedans.

| Domaine       | Responsabilité                                                             |
| ------------- | -------------------------------------------------------------------------- |
| `player`      | Compte joueur, progression globale, bounty, karma                          |
| `ship`        | Navire du joueur : stats, modules, capacité de la réserve et de l'équipage |
| `character`   | Personnages possédés (réserve) et leur arbre d'évolution                   |
| `crew`        | Personnages actifs embarqués sur le navire, moral d'équipage               |
| `event`       | Événements déclenchés lors du `/récap` (AFK)                               |
| `devil_fruit` | Fruits du Démon : bonus de stats et types additionnels pour un personnage  |
| `economy`     | Berry, shops, marchands                                                    |
| `resource`    | Matériaux de craft, artefacts de main story, FDD non consommés             |
| `fishing`     | Action `/pêcher` à la demande : loot, events, avancée scénario             |

D'autres domaines viendront s'ajouter quand le besoin apparaîtra (combat, world…). On ne les crée pas en amont.

### Préfixe `_` : pas un domaine

Un dossier préfixé par `_` dans `domains/` n'est **pas un domaine métier**, c'est un conteneur utilitaire. Il suit la même structure (`commands/`, `interactions/`…) pour pouvoir brancher le router comme un vrai domaine, mais son contenu n'a pas de règles métier propres.

| Dossier | Rôle                                                                                   |
| ------- | -------------------------------------------------------------------------------------- |
| `_dev`  | Commandes de test/debug (ex: `embed`, `moi`, `repeat`). Tout ici dégage avant la prod. |

## Adaptateurs

| Dossier   | Rôle                                                      |
| --------- | --------------------------------------------------------- |
| `discord` | Couche Discord : slash commands, boutons, selects, embeds |

## Persistance

Tout ce qui touche à la base de données vit dans `packages/db/` : les tables, les migrations, la connexion. Les apps l'utilisent comme une bibliothèque.

Les domaines **ne parlent pas directement à la base**. Ils passent par des petites fonctions dédiées (ex: `findPlayer(id)`, `saveShip(ship)`). Ça garde le code métier propre et permet de changer de base plus tard sans tout réécrire.

## Règles d'or

- Un domaine possède son propre **langage ubiquitaire**, documenté dans `docs/domains/<nom>.md`.
- Un domaine n'importe **jamais** un autre domaine directement. Les interactions passent par des interfaces claires.
- La couche `discord` est la seule à parler à `discord.js`.
- Pas de logique métier dans `discord/` — uniquement du routage et du formatage.
