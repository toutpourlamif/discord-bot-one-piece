# La couche `discord/`

Ici vit tout le code qui parle à `discord.js`. Concrètement, deux routers, un pour chaque type d'input Discord :

- **`router.ts`** prend les messages préfixés (`!karma`, `!info luffy`…) et les dispatche.
- **`interactionRouter.ts`** fait pareil pour les interactions UI — aujourd'hui juste les boutons, plus tard les selects et les modals.

L'idée : chaque domaine déclare lui-même ses commandes et ses handlers de bouton, dans son propre dossier. Les routers ne font **que** router — ils importent ce que les domaines exposent, ils mettent tout dans un sac, et quand un event arrive ils cherchent qui matche.

## Comment un domaine déclare ses trucs

Deux types partagés dans `shared/` font office de contrat :

- `Command` — un `name` (le mot qu'on tape après le préfixe) et un `handler` qui reçoit le `Message` et les `args`.
- `ButtonHandler` — un `customIdPrefix` et un `handle` qui reçoit l'interaction.

Chaque domaine a un dossier `commands/` (et `interactions/` s'il en a besoin) avec un `index.ts` qui exporte un tableau. Les routers importent ces tableaux et les concatènent.

## Comment ça match

**Commandes** : match exact sur `name`, insensible à la casse. `!KaRma` passe.

**Boutons** : match sur préfixe du customId. Convention qu'on s'impose : `domaine:concept:id`, par exemple `info:devil_fruit:42`. Le router trouve le handler dont le préfixe matche, et c'est le handler qui se débrouille pour extraire la partie variable (ici `42`).

## Ajouter une commande

1. Un fichier dans `domains/<ton_domaine>/commands/` qui exporte une `Command`.
2. Tu l'ajoutes au tableau dans `domains/<ton_domaine>/commands/index.ts`.
3. Si ton domaine est nouveau, tu l'importes dans `discord/router.ts`.

C'est tout. Pareil pour un handler de bouton, avec `interactions/` à la place de `commands/`.
