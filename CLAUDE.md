# Claude / contributor guide

Ce fichier est le point d'entrée pour Claude Code et tout nouveau contributeur. Il doit rester **court** et pointer vers le reste.

## Le jeu

Bot Discord autour de l'univers One Piece. Le joueur recrute un équipage, améliore son navire, explore, combat. Persistant et multijoueur.

## Stack

- Runtime : Node.js (dernière LTS), exécution TS via `tsx` (pas de build)
- Langage : TypeScript strict (`noUncheckedIndexedAccess`)
- Package manager : pnpm (monorepo `apps/*` + `packages/*`)
- Discord : discord.js v14
- Persistance : PostgreSQL 16 + Drizzle ORM
- Container local : Docker Compose (`pnpm docker:run`)

## Conventions

- `type`, jamais `interface`
- N'exporter un `type` que s'il est importé ailleurs
- Pas de commentaires qui décrivent **ce que** fait le code — uniquement **pourquoi** quand le « pourquoi » est non évident
- **YAGNI** (_You Aren't Gonna Need It_) : on n'ajoute pas une feature, une dep, un helper, un validator tant qu'un code actuel ne l'utilise pas. Pas d'abstractions spéculatives — 3 lignes similaires valent mieux qu'un helper prématuré.
- Les erreurs : gérer aux frontières (entrée Discord, APIs externes, DB). Faire confiance au code interne.
- **TODO** : tout code temporaire (test manuel, stub, placeholder, hack) doit être marqué `// TODO: <raison>`. Permet de le retrouver facilement (`rg TODO`) et de nettoyer avant merge.
- **Repositories** : import en namespace, jamais nommé. Ex : `import * as playerRepository from '../player/repository.js'` puis `playerRepository.findById(...)`. Les fonctions du repo n'ont pas le suffixe d'entité (`findOrCreate`, pas `findOrCreatePlayer`) — le namespace porte déjà l'info.
- **Signatures de fonctions** :
  - **1–2 args métier** : positionnels, `options: OptionsType = {}` en dernier. Ex : `clearTravel(playerId, options)`.
  - **3+ args métier** : un seul param object `{...}` typé via un `type FooParams = {...; options?: OptionsType}`. Ex : `completeTravel({ playerId, bucketId, rng, options })`.

## Structure

```
apps/
  bot/                 ← app Discord (discord.js)
    src/domains/       ← code métier groupé par domaine
packages/
  db/                  ← schéma Drizzle + client DB partagé
docker-compose.yml     ← Postgres local
docs/
  architecture.md      ← vue d'ensemble + liste des domaines
  domains/             ← une doc par domaine (à créer au fur et à mesure)
```

Les **domaines** prévus sont listés dans `docs/architecture.md`. On en ouvre un nouveau uniquement quand on commence à coder dedans — pas d'étages vides.

## Workflow

- Git : un commit = un changement cohérent. Messages et descriptions de PR en **français** (quelques mots anglais tolérés pour les termes techniques).
- **Jamais de commit direct sur `main`**. Toute modification passe par une PR **approuvée par au moins 2 autres personnes** avant merge.

## Qualité

- Hook pre-commit (`husky` + `lint-staged`) : eslint + prettier seulement sur les fichiers touchées, puis typecheck sur toute la codebase.

## Où trouver quoi

- **Comment lancer le bot ?** → `README.md`
- **Comment s'articulent les domaines ?** → `docs/architecture.md`
- **Règles métier d'un domaine X ?** → `docs/domains/X.md`
