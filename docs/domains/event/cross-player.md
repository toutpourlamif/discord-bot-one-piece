# Cross-player : rencontres entre joueurs

Quand deux joueurs sont dans la même zone et que le seed dit "rencontre", on matérialise l'event **pour les deux**.

## `zone_presence` : qui était où

Pour répondre à "qui était dans Z à T", il faut l'historique des zones de **tous les joueurs**, pas juste celui qui recap. Table dédiée :

| Colonne      | Type        | Rôle                             |
| ------------ | ----------- | -------------------------------- |
| `player_id`  | integer FK  |                                  |
| `zone`       | enum        | zone occupée                     |
| `entered_at` | timestamptz | entrée                           |
| `left_at`    | timestamptz | sortie — `NULL` si zone actuelle |

PK `(player_id, entered_at)`. Index principal `(zone, entered_at, left_at)`.

Range query simple :

```sql
SELECT player_id FROM zone_presence
WHERE zone = 'east_blue'
  AND entered_at <= '14:00'
  AND (left_at IS NULL OR left_at > '14:00')
```

> **Pourquoi pas dériver de `history.player.zone_changed`** : window function lourde ("dernier zone_changed avant T pour chaque joueur"), mal indexable, crame à 1000 joueurs. `zone_presence` est une **projection dénormalisée** optimisée pour ce cas de lecture.

### Maintenance

À chaque changement de zone, dans la même transaction Drizzle :

1. UPDATE la ligne courante de `zone_presence` : `left_at = <ts>`.
2. INSERT nouvelle ligne : `entered_at = <ts>, left_at = NULL`.
3. Append `history.player.zone_changed`.

Tout dans la même transaction → toujours synchronisées, pas de drift.

## Règle clé : encounter possible uniquement avec un joueur synced past le bucket

Quand le moteur d'A processe le bucket B et veut un encounter avec X :

> `X.last_processed_bucket_id >= B` ?

- **Oui** → X a vécu ce moment dans son timeline → encounter généré, `event_instance` insérée pour A et X.
- **Non** → X est en retard → **skip**. X n'existe pas dans le monde à ce moment-là.

**Game design : on ne croise que des joueurs déjà synchros à ce moment.** Les AFK sont invisibles aux encounters tant qu'ils ne sont pas synchros.

### Pourquoi cette règle élimine les conflits

Sans elle : Hakim recap à 14h, encounter avec Rayan AFK, Hakim résout un combat. Rayan revient, recap, sa timeline diverge (mainstory à 13h30 → Drum). Conflit avec le combat à 14h.

Avec : Hakim au bucket 14h voit `Rayan.last_processed_bucket_id` correspondant à 12h → skip. **Aucun encounter n'est jamais généré pour un AFK.** Aucun conflit possible.

### Conséquence : encounters AFK différés (pas perdus)

L'encounter Hakim-Rayan ne disparaît pas. Quand Rayan recap au-delà de 14h, son moteur tire le seed du bucket 14h. Si "rencontre Hakim" et que Hakim est synced past 14h, encounter généré pour les deux **à ce moment-là** (au recap de Rayan).

### Encounters temps réel

Quand les deux sont actifs et synchros au bucket courant, le premier qui recap (au prochain bucket complété, donc ~15 min) voit l'autre comme synced et insère pour les deux. L'autre reçoit un DM ou voit l'event au prochain `!recap`. Comme la règle "must be synced" force un recap fréquent, l'event est traité dans la foulée.

### Trade-off accepté : monde "plus vide"

Si la moitié des joueurs sont AFK, le monde paraît plus vide pour les actifs. Sain : peuplé par ceux qui jouent, pas par des fantômes. Un AFK qui revient et `!recap` redevient visible aux autres dès que son `last_processed_bucket_id` rattrape leur fenêtre.

## Cohérence temporelle automatique

Comme **aucun joueur ne peut agir sans être synced**, deux joueurs qui s'encountent sont forcément à jour dans leur timeline. `zone_presence` et `history` sont alignés sur ce qui s'est passé jusqu'à leur `last_processed_bucket_id`. Aucune incohérence à gérer.

## Première détection : INSERT pour les deux

Quand A recap, seed dit "encounter A-B au bucket 14h", B est synced past 14h00 :

- INSERT `event_instance` pending **pour A** avec `encounter_id = X`.
- INSERT `event_instance` pending **pour B** avec le même `encounter_id = X`.
- `encounter_id = hash(bucket_id, sorted_player_ids)` → identique si B re-tire l'encounter plus tard.

L'unicité `(player_id, type, bucket_id)` garantit pas de doublon : si B recap après A et re-tire, INSERT échoue silencieusement.

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

> **Tous les générateurs cross-player utilisent `seedScope: 'zone'`** — c'est ce qui permet à A et B (tirant chacun de leur côté) d'arriver à la même conclusion ("encounter au bucket 14h") sans table partagée.

`appliesTo` = `conditions` mais pour les paires.

## Encounters globaux (inter-serveur)

Les rencontres se produisent entre **tous les joueurs du bot**, peu importe leur serveur Discord. Rayan sur "OnePieceFR" peut croiser Hakim sur "PirateLand" tant qu'ils sont dans la même zone au même bucket.

> **Pourquoi inter-serveur** : avec must-be-synced + même zone + même bucket comme contraintes, restreindre aussi à la même guild rendrait les rencontres trop rares dans la pratique. La densité de rencontres est ce qui rend le monde vivant. Inter-serveur permet aussi de tomber sur des inconnus, ce qui est thématiquement fidèle à One Piece.

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
