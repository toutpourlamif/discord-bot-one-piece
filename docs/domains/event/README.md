# Domaine : event

Un **event** = ce qui arrive au joueur dans le monde du jeu (pêche d'un baril, rencontre avec un autre pirate, combat contre Crocodile, vague qui secoue le navire). Le joueur les découvre via `!recap`.

Jamais déclenchés à la demande : calculés à partir du temps écoulé, de la zone et de l'historique. Le moteur reconstitue ce qui aurait pu se produire pendant que le joueur était AFK.

## Plan de la doc

| Doc                                  | Contenu                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [architecture.md](./architecture.md) | Modèle lazy, buckets 15 min, seed déterministe, passive vs interactive                         |
| [recap-flow.md](./recap-flow.md)     | Règle "synced pour agir", cycle d'un `!recap`, cap 48h                                         |
| [generators.md](./generators.md)     | Contrat `EventGenerator`, filtres, `ctx`, effets, mainstory, ajout d'un event                  |
| [cross-player.md](./cross-player.md) | Rencontres inter-serveur, position via `player.current_zone`, first-clicker-wins, identité, DM |
| [data-model.md](./data-model.md)     | Table `event_instance`, lien avec `history`                                                    |
| [performance.md](./performance.md)   | Pré-agrégation, idempotence, index, `custom_id`, validations boot                              |

## Catalogue minimal pour démarrer

Pour valider l'archi sans écrire 50 générateurs :

- `passive.seagull_flyby` — purement décoratif
- `passive.calm_sea` / `passive.rough_sea` — du remplissage
- `fishing.barrel_found` — premier interactive 1 step
- `combat.pirates_encounter` — premier cross-player

## Organisation des fichiers

```
apps/bot/src/domains/event/
  index.ts                ← exports publics
  engine/
    process-recap.ts      ← orchestration globale
    bucket.ts             ← calcul des buckets
    rng.ts                ← RNG seedé
    apply-effects.ts      ← application des Effect[]
  registry.ts             ← liste de tous les générateurs
  generators/
    passive/seagull-flyby.ts
    fishing/barrel-found.ts
    combat/pirates-encounter.ts
    mainstory/alabasta/{find-map,save-vivi,defeat-crocodile,retry-crocodile}.ts
  types.ts                ← contrat EventGenerator
  repository.ts           ← lecture/écriture event_instance
```

`registry.ts` collecte tout en `Array<EventGenerator>` ; le moteur itère cette liste à chaque bucket.

> **Pourquoi un registry explicite et pas un autoload filesystem** : plus simple à tester, plus simple de désactiver un générateur (commenter une ligne), point d'entrée explicite.
