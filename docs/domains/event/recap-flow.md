# `!recap` — flow et règle de synchro

## Règle fondatrice : synchro pour agir

**Toute action qui modifie le monde** (pêcher, recruter, naviguer, combattre, acheter) **nécessite que le joueur soit à jour.**

Conditions :

1. `last_processed_bucket_id >= currentBucketId() - 1` (= le moteur a déjà processé tous les buckets complets jusqu'à maintenant ; le `-1` parce que le bucket en cours n'est pas encore complet).
2. Aucun **interactive** en attente dans `event_instance`.

Sinon, le bot répond :

> "Tu as des events en attente. Tape `!recap` pour les vivre avant d'agir."

> **Passive en attente n'empêche pas d'agir.** Leurs effets sont déjà appliqués (état synchro), ils ne sont en queue que pour la narration. Le joueur peut donc agir avec une queue d'passive non consommés derrière lui ; il les verra au prochain `!recap` ou en cliquant "Suivant".

### Pourquoi cette règle change tout

Sans : un AFK peut subir une attaque à 14h dans le timeline du monde mais agir comme si rien à 23h. Le bot devrait retconner. Compliqué et incohérent.

Avec : **le joueur traverse son passé avant d'altérer le présent.** Conséquences :

- Plus aucune incohérence temporelle.
- `!recap` devient un passage obligé.
- Pas besoin de `target_effects` dans `history` pour les cross-player : les deux joueurs sont synchros par construction → INSERT direct pour les deux.
- Pas de fast-forward d'autres joueurs : un joueur observé est forcément à jour à son `last_processed_bucket_id`.

### Implémentation : auto-sync dans le routeur

Le routeur Discord (`apps/bot/src/discord/router.ts`) appelle `synchronizePlayer(player.id)` avant chaque commande, sauf si la commande opte explicitement out via `requiresSynchronization: false` sur le type `Command` (cas des domaines `_info`, `_dev`, et de la future `!recap`).

Selon le `SyncResult` :

- `already_caught_up` → on enchaîne sur le handler, rien à dire.
- `caught_up` avec `generatedPassiveCount > 0` → on envoie un message séparé `📜 Ton équipage a vécu N événement(s). Tape !recap pour les revivre.` **avant** d'enchaîner sur le handler. Les passives ont déjà été appliqués pendant la sync — pas besoin de bloquer.
- `blocked_on_interactive` → on `throw new OutOfSyncError(message.author.id)`. Le `catch` du routeur rend l'`userView` portée par l'erreur (cf #188) : un embed warn + un bouton "Voir mes events" (`recap-shortcut`) qui ramène vers `!recap`.

> **Pourquoi un message séparé pour le footer plutôt qu'un append à la réponse de la commande** : éviter de coupler chaque handler (pêche, recrutement, etc.) à une logique de footer. UX-wise, deux messages restent fluides, et l'ordre temporel est naturel (footer avant la réponse de l'action).

> **Atomicité** : `synchronizePlayer` tourne dans sa propre transaction. Si le handler échoue après, la sync reste — pas de rollback. Le joueur retape la commande, `already_caught_up` court-circuite et on passe direct à l'action.

### UX au retour d'AFK

Joueur revient après 6h, tape `!pecher`. Le bot :

> "Tu as 24 events en attente, dont une attaque de Hakim. Tape `!recap` pour les vivre."

Il `!recap`, traverse son timeline (passive affichés, interactive résolus un par un), arrive au présent, et **alors seulement** peut naviguer. Il **rentre dans le monde** au lieu d'agir comme s'il ne l'avait jamais quitté.

## Cycle d'un `!recap`

Deux phases distinctes : **calcul** (rejouer les buckets, appliquer les effets, remplir la queue) puis **affichage** (dérouler la queue événement par événement).

`last_processed_bucket_id` sur `player` = id du dernier bucket que le moteur a calculé pour ce joueur. La queue à dérouler = `SELECT * FROM event_instance WHERE player_id = me ORDER BY bucket_id`.

> Pas "dernière fois qu'on a tapé `!recap`" : c'est "jusqu'à quel bucket on a calculé ses events". Les deux peuvent diverger — un interactif tiré fige `last_processed_bucket_id` jusqu'à résolution, le joueur peut très bien retaper `!recap` plusieurs fois entre temps sans rien faire avancer.

### Phase calcul

À `!recap` au bucket courant `nowBucket = 1234` alors que `last_processed_bucket_id = 1210` (= 24 buckets en arrière, soit 6h) :

1. **Interactive pending dans `event_instance` ?**
   - Oui → on ne calcule rien. Le joueur doit d'abord résoudre le interactive → on passe direct à la phase affichage de la queue actuelle.
   - Non → continuer.
2. Rejouer les buckets de `last_processed_bucket_id + 1` à `nowBucket - 1` (= dernier bucket complet, on ne traite pas le bucket en cours). Cap 48h en amont. Pour chaque bucket :
   - Dériver le seed.
   - Itérer les **passive** : ceux qui passent filtres + proba sont matérialisés. Pour chacun : `effects` appliqués + INSERT `event_instance` (avec `state` figé pour le re-render au clic) + INSERT `history`.
   - Itérer les **interactive** : si plusieurs candidats, tirage pondéré, on en garde **un seul**.
   - Si un interactive est tiré → INSERT `event_instance` (state initial), **stop la boucle**, set `last_processed_bucket_id = ce bucket-id` (cf encadré ci-dessous).
   - Sinon, continuer. Au dernier bucket processé, `last_processed_bucket_id = nowBucket - 1`.
3. **Tout dans une seule transaction Drizzle.**

> **Pourquoi marquer le bucket de l'interactive comme processé (et pas le précédent)** : le bucket interrompu a déjà été entièrement processé (passive matérialisés + interactive tiré). En l'enregistrant comme processé, on garantit qu'au prochain `!recap` (après résolution), l'engine reprend au bucket **suivant** et ne re-tire jamais ce bucket. Aucun risque de re-firer les passive déjà en queue ou déjà consommés. L'unicité `(player_id, event_key, bucket_id)` sur `event_instance` est un filet de sécurité, pas la défense de première ligne.

> **Transaction** = bloc DB tout-ou-rien. Si l'INSERT d'un `event_instance` foire après application d'un effet passive (+50 berries), le joueur ne garde pas les berries sans la trace.

### Phase affichage

Lecture de la queue (ordonnée par `bucket_id`) et affichage du **premier** event :

- **Queue vide** → "Vous n'avez aucun événement en attente."
- **Passive en tête** → retrouver le générateur via `event_key`, appeler `render(state)`, afficher l'embed + bouton **Suivant**. Clic → DELETE l'`event_instance`, render le suivant.
- **Interactive en tête** → appeler `steps[state.step].embed(state, ctx)` + boutons des choix. Clic sur un choix → appliquer les effets, DELETE `event_instance`, INSERT `history`, render le suivant (ou bien `goTo` une autre étape sans DELETE).

Le joueur peut interrompre à tout moment : la queue persiste. Au prochain `!recap`, on recalcule les nouveaux buckets (s'il y en a) puis on reprend l'affichage en haut de queue. Pas de cooldown sur `!recap`.

## Un seul interactive en attente max

Pendant le rejeu, dès qu'un interactive est tiré on s'arrête. Tant qu'il n'est pas résolu, `!recap` se contente de réafficher. Une fois résolu, `!recap` reprend là où il s'était arrêté.

Rationale : rythme narratif (tu vois → tu décides → tu continues), au lieu de balancer 8 décisions d'un coup.

Si plusieurs interactive candidatent sur **un même bucket** : tirage pondéré par leur `weight`, un seul gagne, les autres skippés pour ce bucket. Le `bucket_id` reste un identifiant fiable du contexte.

**Alternatives écartées :**

- _Plusieurs interactive en parallèle_ : menu de quêtes, plus dur à modéliser, casse la narration linéaire de la mainstory.
- _Tout résolu en un clic_ : perd "tu décides et tu vis avec". Et certains events doivent rester ouverts (combat de mainstory laissé en suspens pour s'équiper).

## Cap 48h

Si retour après 5 jours d'AFK, on cap à 48h avant `now()`. Le reste est perdu.

| Raison      | Détail                                                       |
| ----------- | ------------------------------------------------------------ |
| Performance | 5 jours × 96 buckets/jour = 480, contre 192 à 48h.           |
| Game design | `!recap` raconte le récent, pas le mois de vacances.         |
| Simplicité  | Pas de logique pour "compresser 5 jours en quelques events". |

48h est arbitraire, ajustable.
