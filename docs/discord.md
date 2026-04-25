# La couche `discord/`

Ici vit tout le code qui parle à `discord.js`. Concrètement, deux routers, un pour chaque type d'input Discord :

- **`router.ts`** prend les messages préfixés (`!karma`, `!info luffy`…) et les dispatche.
- **`interactionRouter.ts`** fait pareil pour les interactions UI — aujourd'hui juste les boutons, plus tard les selects et les modals.

L'idée : chaque domaine déclare lui-même ses commandes et ses handlers de bouton, dans son propre dossier. Les routers ne font **que** router — ils importent ce que les domaines exposent, ils mettent tout dans un sac, et quand un event arrive ils cherchent qui matche.

## Comment un domaine déclare ses trucs

Deux types partagés font office de contrat :

- `Command` — un `name` (le mot qu'on tape après le préfixe) et un `handler` qui reçoit le `Message` et les `args`.
- `ButtonHandler` — un `name` (l'identifiant logique du bouton) et un `handle` qui reçoit l'interaction et les `args` parsés depuis le `customId`.

Chaque domaine a un dossier `commands/` (et `interactions/` s'il en a besoin) avec un `index.ts` qui exporte un tableau. Les routers importent ces tableaux et les concatènent.

## Comment ça match

**Commandes** (messages) : le router prend ce qui vient après le préfixe (`!`), split sur les espaces. Le premier mot c'est le `name`, le reste c'est `args`. Match exact sur `name`, insensible à la casse — `!KaRma` passe.

**Boutons** (interactions) : exactement la même logique, mais sur le `customId` du bouton, séparé par `:` au lieu d'un espace. Le router split sur `:`, le premier segment c'est le `name`, le reste c'est `args`.

Exemple : un bouton avec `customId = "inventory:42:1"` est routé vers le `ButtonHandler` dont `name === 'inventory'`, et le handler reçoit `args = ['42', '1']`. À lui de faire `Number(args[0])` pour récupérer le `playerId` et `Number(args[1])` pour la page.

L'idée : c'est le même mental model que pour une commande Discord — un nom, des arguments. Si t'as compris comment marche `!inventaire @bob`, t'as compris comment marche un bouton.

## Construire un `customId`

Utilise `discord/utils/build-custom-id.ts`. Tu lui donnes le `name` de ton handler et tes args, il fabrique la string et vérifie la limite Discord (100 chars max) :

```ts
buildCustomId('inventory', playerId, page); // -> "inventory:42:1"
buildCustomId('infofruit', fruitId); // -> "infofruit:7"
```

Évite de concaténer toi-même — passe par le helper, comme ça si on change le séparateur ou la limite un jour, c'est centralisé.

## Ajouter une commande

1. Un fichier dans `domains/<ton_domaine>/commands/` qui exporte une `Command`.
2. Tu l'ajoutes au tableau dans `domains/<ton_domaine>/commands/index.ts`.
3. Si ton domaine est nouveau, tu l'importes dans `discord/router.ts`.

## Ajouter un bouton

1. Un fichier dans `domains/<ton_domaine>/interactions/` qui exporte un `ButtonHandler` avec un `name` unique (`infofruit`, `inventory`, `menu`…).
2. Tu l'ajoutes au tableau exposé par `domains/<ton_domaine>/index.ts`.
3. Côté view, quand tu construis ton bouton, fais `buildCustomId(MON_BUTTON_NAME, ...args)` pour le `setCustomId`.
4. Si ton domaine est nouveau, tu l'importes dans `discord/interactionRouter.ts`.

**Attention** : le `name` doit être unique à travers tout le bot. Deux handlers avec `name === 'info'` → le second n'est jamais appelé. Un `name` par "type d'action", comme un endpoint d'API.
