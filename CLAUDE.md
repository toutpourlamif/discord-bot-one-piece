# Claude / contributor guide

Ce fichier est le point d'entrée pour Claude Code et tout nouveau contributeur. Il doit rester **court** et pointer vers le reste.

## Le jeu

Bot Discord autour de l'univers One Piece. Le joueur recrute un équipage, améliore son navire, explore, combat. Persistant et multijoueur.

## Stack

À confirmer au premier commit de code :

- Runtime : Node.js (dernière LTS)
- Langage : TypeScript
- Package manager : pnpm
- Discord : _à décider (discord.js v14 par défaut)_
- Persistance : _à décider_

## Conventions

- `type`, jamais `interface`
- N'exporter un `type` que s'il est importé ailleurs
- Pas de commentaires qui décrivent **ce que** fait le code — uniquement **pourquoi** quand le « pourquoi » est non évident
- **YAGNI** (_You Aren't Gonna Need It_) : on n'ajoute pas une feature, une dep, un helper, un validator tant qu'un code actuel ne l'utilise pas. Pas d'abstractions spéculatives — 3 lignes similaires valent mieux qu'un helper prématuré.
- Les erreurs : gérer aux frontières (entrée Discord, APIs externes, DB). Faire confiance au code interne.
- **TODO** : tout code temporaire (test manuel, stub, placeholder, hack) doit être marqué `// TODO: <raison>`. Permet de le retrouver facilement (`rg TODO`) et de nettoyer avant merge.

## Structure

```
CLAUDE.md              ← ce fichier
README.md              ← pitch + quickstart
docs/
  architecture.md      ← vue d'ensemble + liste des domaines
  domains/             ← une doc par domaine métier (à créer au fur et à mesure)
src/
  domains/             ← code métier groupé par domaine
  ...
```

Les **domaines** prévus sont listés dans `docs/architecture.md`. On en ouvre un nouveau uniquement quand on commence à coder dedans — pas d'étages vides.

## Workflow

- Git : un commit = un changement cohérent. Messages et descriptions de PR en **français** (quelques mots anglais tolérés pour les termes techniques).
- **Jamais de commit direct sur `main`**. Toute modification passe par une PR **approuvée par au moins 2 autres personnes** avant merge.

## Où trouver quoi

- **Comment lancer le bot ?** → `README.md`
- **Comment s'articulent les domaines ?** → `docs/architecture.md`
- **Règles métier d'un domaine X ?** → `docs/domains/X.md`
