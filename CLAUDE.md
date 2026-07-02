# Claude / contributor guide

Ce fichier est le point d'entrée pour Claude Code et tout nouveau contributeur. Il doit rester **court** et pointer vers le reste.

Un `CLAUDE.md` n'est pas une documentation exhaustive comme le `README.md` ou les docs métier. C'est un mémo de contexte : il explique à Claude Code les règles réellement utilisées dans le repo pour que ses modifications ressemblent au code existant. Toute règle ajoutée ici doit donc être concrète, appliquée aujourd'hui, et assez claire pour être suivie sans deviner.

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
- **Imports relatifs ESM** : ESM est le système `import`/`export` natif de Node. En ESM, un import relatif doit pointer vers le fichier JS qui existera à l'exécution : on écrit donc `.js`, même depuis un fichier source `.ts`. NodeNext/`tsx` fait le lien avec le `.ts` pendant le dev.
  ```ts
  import { buy, sell } from './service.js';
  ```
- Helpers et fonctions top-level : `function foo() {}`, pas `const foo = () => {}`
- **Public first, private after** : dans un fichier, les constantes privées en haut (juste après les imports), puis les exports (API publique), puis les helpers/types privés en dessous. On lit d'abord ce que le fichier expose, les détails ensuite.
- **Unions de strings depuis un tableau `as const`** : quand une valeur ne peut prendre qu'une liste finie de strings, la liste runtime est la source de vérité. On déclare le tableau une seule fois, puis TypeScript dérive le type depuis ce tableau. Ça évite d'avoir une union écrite à la main qui peut se désynchroniser.
  ```ts
  export const SHIP_MODULE_KEYS = ['hull', 'sail', 'decks', 'cabins', 'cargo'] as const;
  export type ShipModuleKey = (typeof SHIP_MODULE_KEYS)[number];
  ```
- Pas de commentaires qui décrivent **ce que** fait le code — uniquement **pourquoi** quand le « pourquoi » est non évident
- **Short guards inline** : `if (cond) return …;`, `if (cond) throw …;`, etc. tiennent sur **une ligne sans accolades**. Pas d'ESLint `curly`.
- **YAGNI** (_You Aren't Gonna Need It_) : on n'ajoute pas une feature, une dep, un helper, un validator tant qu'un code actuel ne l'utilise pas. Pas d'abstractions spéculatives — 3 lignes similaires valent mieux qu'un helper prématuré.
- **Lisibilité = priorité MÉGA importante.** Toujours nommer variables/fonctions/types pour que le sens soit évident sans lire l'implémentation (`shipKey`, pas `key` ; `updatedShip`, pas `updated`). Pas de `data`/`tmp`/`res`/lettres seules (sauf index de boucle triviaux). Découper agressivement, au niveau macro (petites fonctions/fichiers bien nommés) **et** local (extraire des consts intermédiaires nommées plutôt qu'imbriquer/chaîner des expressions illisibles). On optimise pour le prochain lecteur, pas pour le nombre de lignes.
- **Types Drizzle inférés depuis les tables** : le schéma Drizzle est la source de vérité de la DB. Ne pas réécrire à la main le type d'une ligne : utiliser `$inferSelect` pour une ligne lue en base. Pour un objet à insérer, utiliser `$inferInsert` et le suffixe `Insert`.
  ```ts
  export type Ship = typeof ship.$inferSelect;
  export type ShipInsert = typeof ship.$inferInsert;
  ```
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
