# One Piece Discord Bot

Un bot Discord de jeu dans l'univers One Piece : recrutement d'équipage, amélioration de navire, exploration, combat.

## Quickstart

1. `pnpm install`
2. Copier `.env.local.example` → `.env.local` dans `apps/bot/` et `packages/db/`, puis renseigner `DISCORD_TOKEN`
3. `pnpm docker:run` (laisser tourner, Postgres en foreground — `Ctrl+C` pour kill)
4. Dans un autre terminal : `pnpm db:migrate` puis `pnpm dev`

## Scripts

| Commande                       | Effet                                         |
| ------------------------------ | --------------------------------------------- |
| `pnpm dev`                     | lance le bot en watch mode                    |
| `pnpm docker:run`              | lance Postgres local (foreground)             |
| `pnpm db:generate`             | génère une migration depuis le schéma Drizzle |
| `pnpm db:migrate`              | applique les migrations sur la DB locale      |
| `pnpm db:studio`               | ouvre Drizzle Studio (`localhost:4983`)       |
| `pnpm lint` / `pnpm lint:fix`  | lint ESLint                                   |
| `pnpm format` / `format:check` | format Prettier                               |
| `pnpm typecheck`               | typecheck tous les workspaces                 |

## Documentation

- [CLAUDE.md](./CLAUDE.md) — conventions de code et d'organisation
- [docs/architecture.md](./docs/architecture.md) — vue d'ensemble et domaines
