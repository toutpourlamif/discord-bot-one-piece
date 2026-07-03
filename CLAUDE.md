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
- `Array<T>`, jamais `T[]` (ESLint actif)
- Helpers et fonctions top-level : `function foo() {}`, pas `const foo = () => {}`
- **Public first, private after** : dans un fichier, les constantes privées en haut (juste après les imports), puis les exports (API publique), puis les helpers/types privés en dessous. On lit d'abord ce que le fichier expose, les détails ensuite.
- Pas de commentaires qui décrivent **ce que** fait le code — uniquement **pourquoi** quand le « pourquoi » est non évident
- **Short guards inline** : `if (cond) return …;`, `if (cond) throw …;`, etc. tiennent sur **une ligne sans accolades**. Pas d'ESLint `curly`.
- **YAGNI** (_You Aren't Gonna Need It_) : on n'ajoute pas une feature, une dep, un helper, un validator tant qu'un code actuel ne l'utilise pas. Pas d'abstractions spéculatives — 3 lignes similaires valent mieux qu'un helper prématuré.
- **Lisibilité = priorité MÉGA importante.** Toujours nommer variables/fonctions/types pour que le sens soit évident sans lire l'implémentation (`shipKey`, pas `key` ; `updatedShip`, pas `updated`). Pas de `data`/`tmp`/`res`/lettres seules (sauf index de boucle triviaux). Découper agressivement, au niveau macro (petites fonctions/fichiers bien nommés) **et** local (extraire des consts intermédiaires nommées plutôt qu'imbriquer/chaîner des expressions illisibles). On optimise pour le prochain lecteur, pas pour le nombre de lignes.
- **Toujours le nom le plus explicite**, même pour un local trivial : on préfère systématiquement la forme complète à l'abrégé (`trimmedValue`, pas `trimmed` ; `betAmount`, pas `bet` ; `updatedShip`, pas `updated`). Dans le doute, on rallonge.
- **Gardes** : dès qu'une validation/précondition dépasse le guard inline trivial, l'extraire dans une garde (fonction `assert*` qui **throw**, jamais de retour d'erreur). Si la garde est réutilisée par plusieurs fichiers → `guards/` + export ; si elle ne sert que dans un seul fichier → helper privé **dans ce même fichier** (pas de fichier/dossier dédié pour une garde utilisée une seule fois). Cf. `assertPlayerIsAdmin`, `assertCrewHasAvailableSlot`.
- Les erreurs : gérer aux frontières (entrée Discord, APIs externes, DB). Faire confiance au code interne.
- **Erreurs de validation = `throw`, pas `return`** : dans un handler, en cas d'erreur (input invalide, état interdit…) on `throw` une `AppError` (`ValidationError`, `NotFoundError`, …) plutôt que de répondre manuellement puis `return`. Le boundary (`discord/router.ts`) formate le message et le log — on ne le refait pas à la main.
- **Embeds de feedback** : `buildOpEmbed('success')` quand une action réussit (feedback positif, bonne UX) ; `'warn'`/`'error'` portés par l'`AppError` correspondante. `default` seulement pour de l'affichage neutre.
- **History log types** : le `type` se nomme en camelCase après le préfixe de domaine (ex : `ship.templateSwitched`, `player.subZoneChanged`), pas en kebab/snake.
- **TODO** : tout code temporaire (test manuel, stub, placeholder, hack) doit être marqué `// TODO: <raison>`. Permet de le retrouver facilement (`rg TODO`) et de nettoyer avant merge.
- **Repositories & services** : import en namespace, jamais nommé. Ex : `import * as playerRepository from '../player/repository.js'` puis `playerRepository.findById(...)` ; `import * as onboardingService from '../services/index.js'` puis `onboardingService.advanceOnboarding(...)`. Les fonctions n'ont pas le suffixe d'entité (`findOrCreate`, pas `findOrCreatePlayer`) — le namespace porte déjà l'info.
- **Signatures de fonctions** :
  - **1–2 args métier** : positionnels, `options: OptionsType = {}` en dernier. Ex : `clearTravel(playerId, options)`.
  - **3+ args métier** : un seul param object `{...}` typé via un `type FooParams = {...; options?: OptionsType}`. Ex : `completeTravel({ playerId, bucketId, rng, options })`.
- **Handlers Discord** : `deferUpdate()` / `deferReply()` **avant** toute opération DB ou réseau (sinon l'interaction expire).
- **Pas de logique métier dans `discord/`** : c'est un adaptateur (routage + formatage des messages/embeds). La logique vit dans `domains/`.
- **Commandes** : flags sur `Command`. Par défaut, le routeur sync le joueur avant le handler — s'il a un interactif pending, ça bloque la commande (`OutOfSyncError`). `requiresSynchronization: false` opt-out des deux (sync + gate), pour `!recap`, `_info`, `_dev`. `requiresOpAdmin: true` exige `player.isAdmin` (cf `assertPlayerIsAdmin`). Détails : `docs/domains/event/recap-flow.md`.

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
- **Assets images** : ne pas se soucier du format source (`.jpg`, `.png`, …). Un script pre-commit convertit automatiquement les images en `.webp`. On dépose l'image telle quelle, le code référence toujours le `.webp` final.

## Où trouver quoi

- **Comment lancer le bot ?** → `README.md`
- **Comment s'articulent les domaines ?** → `docs/architecture.md`
- **Règles métier d'un domaine X ?** → `docs/domains/X.md`
