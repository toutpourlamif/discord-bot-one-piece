# `!recap` — flow et règle de synchro

## Règle fondatrice : synchro pour agir

**Toute action qui modifie le monde** (pêcher, recruter, naviguer, combattre, acheter) **nécessite que le joueur soit à jour.**

Conditions :

1. `last_recap_at` = fin du dernier bucket complet (le moteur a calculé tout ce qui aurait pu arriver).
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
- Pas de fast-forward d'autres joueurs : un joueur observé est forcément à jour à son `last_recap_at`.

### Implémentation : middleware

Appliqué aux commandes "actives" au routeur Discord (toutes sauf `!recap`, `!profil`, `!aide`) :

```ts
async function requireSyncedPlayer(playerId, message): Promise<boolean> {
  if (await playerRepository.isPlayerCaughtUp(playerId)) return true;
  await message.reply({
    embeds: [
      /* "tape !recap d'abord" */
    ],
  });
  return false;
}
```

`isPlayerCaughtUp` vérifie les deux conditions ci-dessus.

### UX au retour d'AFK

Joueur revient après 6h, tape `!pecher`. Le bot :

> "Tu as 24 events en attente, dont une attaque de Hakim. Tape `!recap` pour les vivre."

Il `!recap`, traverse son timeline (passive affichés, interactive résolus un par un), arrive au présent, et **alors seulement** peut naviguer. Il **rentre dans le monde** au lieu d'agir comme s'il ne l'avait jamais quitté.

## Cycle d'un `!recap`

Deux phases distinctes : **calcul** (rejouer les buckets, appliquer les effets, remplir la queue) puis **affichage** (dérouler la queue événement par événement).

`last_recap_at` sur `player` = jusqu'où le moteur a calculé. La queue à dérouler = `SELECT * FROM event_instance WHERE player_id = me ORDER BY bucket_id`.

> Pas exactement "dernière fois qu'on a recap" : c'est "jusqu'à quel point dans le temps on a calculé ses events". Peut reculer si un interactive fige le moteur.

### Phase calcul

À `!recap` à 18h00 avec `last_recap_at = 12h00` :

1. **Interactive pending dans `event_instance` ?**
   - Oui → on ne calcule rien. Le joueur doit d'abord résoudre le interactive → on passe direct à la phase affichage de la queue actuelle.
   - Non → continuer.
2. Rejouer les buckets entre `last_recap_at` et `now()` (cap 48h). Pour chaque bucket :
   - Dériver le seed.
   - Itérer les **passive** : ceux qui passent filtres + proba sont matérialisés. Pour chacun : `effects` appliqués + INSERT `event_instance` (avec `state` figé pour le re-render au clic) + INSERT `history`.
   - Itérer les **interactive** : si plusieurs candidats, tirage pondéré, on en garde **un seul**.
   - Si un interactive est tiré → INSERT `event_instance` (state initial), **stop la boucle**, figer `last_recap_at` à la **fin** de ce bucket (cf encadré ci-dessous).
   - Sinon, continuer. Au dernier bucket, `last_recap_at = now()`.

> **Pourquoi figer `last_recap_at` à la fin du bucket du interactive (pas au début)** : le bucket interrompu a déjà été entièrement processé (passive matérialisés + interactive tiré). En le figeant à la fin, on garantit qu'au prochain `!recap` (après résolution), l'engine reprend au bucket **suivant** et ne re-tire jamais ce bucket. Aucun risque de re-firer les passive déjà en queue ou déjà consommés. L'unicité `(player_id, type, bucket_id)` sur `event_instance` est un filet de sécurité, pas la défense de première ligne. 3. **Tout dans une seule transaction Drizzle.**

> **Transaction** = bloc DB tout-ou-rien. Si l'INSERT d'un `event_instance` foire après application d'un effet passive (+50 berries), le joueur ne garde pas les berries sans la trace.

### Phase affichage

Lecture de la queue (ordonnée par `bucket_id`) et affichage du **premier** event :

- **Queue vide** → "Vous n'avez aucun événement en attente."
- **Passive en tête** → retrouver le générateur via `type`, appeler `render(state)`, afficher l'embed + bouton **Suivant**. Clic → DELETE l'`event_instance`, render le suivant.
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
