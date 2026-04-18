# Architecture

## Vue d'ensemble

Le bot est structuré autour de **domaines métier** purs. La couche **`discord`** est un adaptateur : elle traduit les entrées Discord (slash commands, boutons, selects) en appels aux domaines, et formate les résultats en messages/embeds.

```
Discord UI  ──>  discord (adapter)  ──>  domains (logique métier)  ──>  persistence
```

## Domaines actuels

On ouvre un domaine (dossier + doc) uniquement au moment où on commence à coder dedans.

| Domaine   | Responsabilité                                               |
|-----------|--------------------------------------------------------------|
| `player`  | Compte joueur, progression, inventaire                       |
| `ship`    | Navire du joueur : stats, modules, améliorations             |
| `event`   | Événements du jeu (combats, rencontres, découvertes)         |

D'autres domaines viendront s'ajouter quand le besoin apparaîtra (crew, combat, economy, world…). On ne les crée pas en amont.

## Adaptateurs

| Dossier   | Rôle                                                         |
|-----------|--------------------------------------------------------------|
| `discord` | Couche Discord : slash commands, boutons, selects, embeds    |

## Règles d'or

- Un domaine possède son propre **langage ubiquitaire**, documenté dans `docs/domains/<nom>.md`.
- Un domaine n'importe **jamais** un autre domaine directement. Les interactions passent par des interfaces claires.
- La couche `discord` est la seule à parler à `discord.js`.
- Pas de logique métier dans `discord/` — uniquement du routage et du formatage.
ça