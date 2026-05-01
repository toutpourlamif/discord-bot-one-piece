# Domaine : history

## Concept

L'**historique** est la mémoire du bot. À chaque fois qu'un joueur fait quelque chose qu'on voudra peut-être ressortir plus tard, on l'écrit ici. Une ligne = une action passée.

## À quoi ça sert

Deux usages, dans cet ordre d'importance :

1. **Réutiliser le passé pour les events.** Beaucoup d'events réagissent à ce que le joueur a fait avant. Exemples :
   - Un joueur refuse 4 fois la même île → il tourne en rond, ses personnages ont la nausée.
   - Un joueur a déjà mangé un fruit du démon → on lui en propose moins pendant un certain temps.
   - Un joueur a trahi son capitaine → certains personnages refusent de rejoindre son équipage.

   Sans l'historique, ces infos sont perdues une fois l'action faite. La table joueur ne peut pas tout porter sous forme de compteurs ad hoc.

2. **Comprendre ce qui se passe dans le bot.** Combien de joueurs utilisent telle action, quelle action est la plus populaire, à quel moment les joueurs décrochent, debug d'incidents joueur (« il dit qu'il a perdu son fruit, qu'est-ce qui s'est passé ? »).

## Règle de base : on n'écrase jamais une ligne

Une fois écrite, une entrée ne change plus. Si une action est annulée, on écrit une **nouvelle** entrée (`xxx.cancelled`) plutôt que de modifier l'ancienne. Comme ça l'historique reste fidèle à ce qui s'est vraiment passé.

## Ce qu'on écrit (ou pas)

On écrit dès qu'une action peut être **comptée, recoupée ou rappelée plus tard**.

On n'écrit **pas** ce qui est déjà déductible de l'état actuel. Exemple : pas besoin d'enregistrer la création du joueur, on a déjà `player.created_at`.

## Comment c'est organisé

### La table `history`

Une seule table, avec quelques colonnes fixes pour les questions qu'on posera souvent (qui, quand, quoi, sur quoi) et un champ `payload` libre en JSON pour les détails spécifiques à chaque type d'action.

| Colonne                     | À quoi ça sert                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `occurred_at`               | Quand l'action a eu lieu                                                             |
| `event_type`                | Quoi : `crew.captain_changed`, `island.refused`, `fruit.eaten`…                      |
| `actor_player_id`           | Qui a fait l'action (vide si c'est le système : un cron, un admin)                   |
| `target_type` + `target_id` | Sur quoi porte l'action (un personnage, un fruit, un navire…). Volontairement libre. |
| `payload`                   | Les détails spécifiques au type d'action, en JSON                                    |

> `target_id` peut pointer vers n'importe quelle table, donc on ne met pas de clé étrangère dessus. C'est voulu : ça nous laisse libres d'effacer de vieilles entrées plus tard sans casser de contraintes.

### Convention de nommage

Format : `<domaine>.<action_au_passé>`. Exemples :

- `crew.captain_changed`
- `island.refused`
- `fruit.eaten`
- `ship.upgraded`

## Code applicatif

### Un seul helper : `appendHistory`

Tout passe par `appendHistory(...)`, dans `apps/bot/src/domains/history/`.

```ts
appendHistory({
  type: 'crew.captain_changed', // l'IDE auto-complète le payload selon le type
  payload: { fromCharacterInstanceId, toCharacterInstanceId },
  actorPlayerId: player.id,
  target: { type: 'character_instance', id: instanceId },
  client: transaction, // optionnel — voir ci-dessous
});
```

### Atomicité avec l'action métier

Quand le log doit être indissociable de l'action (ex. `crew.captain_changed` ne doit pas exister si l'UPDATE du capitaine a échoué), on passe la transaction Drizzle via `client`. Le helper écrit alors dans la même transaction que l'action.

Si l'action et le log sont indépendants, on omet `client` (le helper utilise `db` par défaut).

### Ajouter un nouveau type

Les types des payloads sont déclarés dans `apps/bot/src/domains/history/types/`, **un fichier par domaine métier** (`crew.ts`, `ship.ts`, `fruit.ts`…). Chaque fichier exporte l'union des logs de son domaine, et `types/index.ts` agrège l'union finale `Log`.

Pour ajouter un type :

1. Créer (ou compléter) le fichier du domaine concerné dans `types/`.
2. Ajouter le nouveau type à l'union du domaine.
3. Si c'est un nouveau domaine : l'ajouter à l'union centrale dans `types/index.ts`.
4. Documenter le payload dans le catalogue ci-dessous.
5. Appeler `appendHistory` depuis le service métier.

## Catalogue des types

> Liste vivante. Chaque entrée décrit la forme attendue du `payload`.

### `crew.captain_changed`

Le capitaine d'équipage d'un joueur change.

```ts
payload: {
  fromCharacterInstanceId: number | null; // null si pas de capitaine avant
  toCharacterInstanceId: number;
}
target: { type: 'character_instance', id: <nouveau capitaine> }
actorPlayerId: <joueur>
```
