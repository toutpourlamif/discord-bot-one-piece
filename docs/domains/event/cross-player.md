# Cross-player : rencontres entre joueurs

Quand deux joueurs sont **actuellement** dans la même zone et que le seed dit "rencontre", on matérialise l'event **pour les deux**.

## Position courante

Chaque joueur a une colonne `player.current_zone` (cf domaine `player`) qui pointe sur la zone où il est en ce moment. Lookup O(1), pas d'historique d'intervalles à maintenir.

## La règle d'or : encounters seulement au bucket courant

Quand le moteur d'A processe ses buckets pendant un `!recap` :

- Sur **tous les buckets passés** (entre `last_recap_at` et `now() - 1 bucket`) → **aucun check d'encounter**. Juste les passifs et interactifs perso d'A.
- Sur le **dernier bucket** processé (= le bucket courant, là où A rattrape `now()`) → check des encounters : "qui d'autre est actuellement dans la même zone que moi ET synced past ce bucket ?".

> **Pourquoi seulement le bucket courant** : sinon on rétroactivement modifie le passé d'autres joueurs déjà synchros. Exemple : Rayan synced à 18h, Hakim recap depuis 12h. Si Hakim "attaque Rayan à 15h", Rayan a déjà processé son bucket 15h sans cet event et a peut-être agi entre 15h et 18h sur la base d'un état périmé. Inconsistance temporelle pure. La règle "bucket courant uniquement" empêche tout ça.

> **Conséquence** : un encounter cross-player n'arrive **que** quand les deux joueurs sont actifs et synchros à peu près en même temps.

## Première détection : INSERT pour les deux

Quand A processe son bucket courant, le seed dit "encounter A-B", et B est synced past ce bucket :

- INSERT `event_instance` pending **pour A** avec `encounter_id = X`.
- INSERT `event_instance` pending **pour B** avec le même `encounter_id = X`.
- `encounter_id = hash(bucket_id, sorted_player_ids)` → identique si B re-tire l'encounter de son côté plus tard.

L'unicité `(player_id, type, bucket_id)` garantit pas de doublon : si B recap quelques secondes après A et re-tire le même encounter, l'INSERT échoue silencieusement.

> **Race condition** = situation où le résultat dépend de l'ordre/timing entre opérations parallèles. Sans la contrainte d'unicité, deux INSERT simultanés pourraient créer des doublons. Avec, l'un gagne, l'autre échoue proprement.

## First-clicker-wins

A et B voient chacun les boutons.

- **Premier clic gagne le contrôle** :
  - Suppression atomique des **deux** `event_instance` du pair (via `encounter_id`).
  - Calcul de l'outcome, application des effets aux deux.
  - Append `history` avec le pair et le choix.
- Second qui clique : 0 lignes supprimées → "trop lent, l'autre a choisi" + résumé.
- Joueur qui se connecte après résolution : `event_instance` n'existe plus, le moteur consulte `history` et affiche un passive "à 14h t'as croisé A, voici ce qu'il s'est passé".

> **Pourquoi pas une négociation** : si B prend 1h, A est bloqué (1 interactive max + must-be-synced). Mauvaise UX. First-clicker = qui agit, agit. Plus rapide, plus dynamique, fidèle aux pirates.

## Compatibilité (`appliesTo`)

Tous les events cross-player ne s'appliquent pas à toutes les paires (combat pirates : oui ; alliance Marine/Pirate : non).

```ts
const piratesEncounter: EventGenerator = {
  type: 'combat.pirates_encounter',
  scope: 'interactive',
  seedScope: 'zone', // tirage partagé entre tous les joueurs présents dans la zone
  appliesTo: (a, b) => a.status === 'PIRATE' && b.status === 'PIRATE',
  probability: (a, b) => 0.3,
  ...
};

const piratesAlliance: EventGenerator = {
  type: 'alliance.pirates',
  scope: 'interactive',
  seedScope: 'zone',
  appliesTo: (a, b) => a.status === 'PIRATE' && b.status === 'PIRATE',
  probability: () => 0.02, // rare
  ...
};
```

> **Tous les générateurs cross-player utilisent `seedScope: 'zone'`** — c'est ce qui permet à A et B (tirant chacun de leur côté) d'arriver à la même conclusion ("encounter au bucket B") sans table partagée.

`appliesTo` = `conditions` mais pour les paires.

## Encounters globaux (inter-serveur)

Les rencontres se produisent entre **tous les joueurs du bot**, peu importe leur serveur Discord. Rayan sur "OnePieceFR" peut croiser Hakim sur "PirateLand" tant qu'ils sont dans la même zone au même bucket courant.

> **Pourquoi inter-serveur** : avec must-be-synced + même zone + même bucket courant comme contraintes, restreindre aussi à la même guild rendrait les rencontres trop rares dans la pratique. La densité de rencontres est ce qui rend le monde vivant. Inter-serveur permet aussi de tomber sur des inconnus, ce qui est thématiquement fidèle à One Piece.

> **Indépendant du leaderboard** : le `!leaderboard` reste **par serveur** (liste les membres présents sur le serveur courant qui ont joué — voir le domaine `guild_player` pour le tracking présence joueur/serveur). Un joueur peut donc apparaître dans plusieurs leaderboards locaux sans que ça change quoi que ce soit aux encounters.

## Identité affichée pendant un encounter

Quand A croise B, on affiche le **nom de pirate** de B (déjà unique dans le jeu) + un **tag du serveur d'origine** de B en discret, par exemple :

> _« Tu croises Hakim — OnePieceFR. »_

Le serveur d'origine est figé à la création du joueur (cf colonne `player.origin_guild_id` dans [data-model.md](./data-model.md)). Il ne change jamais, même si le joueur devient actif sur d'autres serveurs.

> **Pourquoi le serveur d'origine et pas "le dernier serveur joué"** : stable, gratuit à calculer, et thématiquement fort — comme dans One Piece, ton île d'origine reste avec toi toute ta vie.

> **Edge case** : si le bot a été kické du serveur d'origine, on n'a pas le nom à afficher. Fallback : juste le nom de pirate sans tag.

## Notification DM

Quand un `event_instance` est créé pour un joueur **qui n'est pas en train de `!recap`**, on lui envoie un DM Discord.

Cas typique : encounter cross-player → A recap, INSERT pour A et B, A est notifié dans la conversation actuelle, B reçoit un DM.

> **DM** = Direct Message Discord du bot vers l'utilisateur.

**Best-effort** : si le joueur a désactivé les DM du bot, l'API renvoie une erreur, on l'ignore. Le joueur verra son event au prochain `!recap` manuel — pas perdu.
