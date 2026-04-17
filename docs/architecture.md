# Architecture

## Vue d'ensemble

Le bot est structuré autour de **domaines métier**. La couche Discord (slash commands, interactions) est un adaptateur : elle traduit les entrées utilisateur en appels aux domaines, et formate les résultats en messages/embeds.

```
Discord UI  ──>  commands (adapter)  ──>  domains (logique métier)  ──>  persistence
```

## Domaines actuels

On ouvre un domaine (dossier + doc) uniquement au moment où on commence à coder dedans.

| Domaine    | Responsabilité                                               |
|------------|--------------------------------------------------------------|
| `player`   | Compte joueur, progression, inventaire                       |
| `ship`     | Navire du joueur : stats, modules, améliorations             |
| `event`    | Événements du jeu (combats, rencontres, découvertes)         |
| `commands` | Adaptateur Discord : slash commands, boutons, selects        |

D'autres domaines viendront s'ajouter quand le besoin apparaîtra (crew, combat, economy, world…). On ne les crée pas en amont.

## Règles d'or

- Un domaine possède son propre **langage ubiquitaire**, documenté dans `docs/domains/<nom>.md`.
- Un domaine n'importe **jamais** un autre domaine directement. Les interactions passent par des interfaces claires.
- La couche `commands` est la seule à parler à discord.js.
- Pas de logique métier dans les commandes Discord — uniquement du routage et du formatage.
