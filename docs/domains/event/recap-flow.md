# `!recap` — flow et règle de synchro

## Règle fondatrice : synchro pour agir

**Toute action qui modifie le monde** (pêcher, recruter, naviguer, combattre, acheter) **nécessite que le joueur soit à jour.**

Conditions :

1. `last_recap_at` = fin du dernier bucket complet (tous les events passés vécus).
2. Aucun `event_instance` en attente.

Sinon, le bot répond :

> "Tu as des events en attente. Tape `!recap` pour les vivre avant d'agir."

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

Il `!recap`, traverse son timeline (ambient affichés, stateful résolus un par un), arrive au présent, et **alors seulement** peut naviguer. Il **rentre dans le monde** au lieu d'agir comme s'il ne l'avait jamais quitté.

## Cycle d'un `!recap`

`last_recap_at` sur `player` = jusqu'où on a déjà traité les buckets du joueur.

> Pas exactement "dernière fois qu'on a recap" : c'est "jusqu'à quel point dans le temps on a calculé ses events". Peut reculer si un stateful nous fige.

À `!recap` à 18h00 avec `last_recap_at = 12h00` :

1. **`event_instance` pending ?**
   - Oui → réafficher (embed + boutons), aucun nouveau bucket traité.
   - Non → continuer.
2. **Rejouer les buckets entre `last_recap_at` et `now()`** (cap 48h). Pour chaque bucket :
   - Dériver le seed.
   - Itérer les **ambient** : ceux qui passent filtres + proba sont matérialisés (embed + effets).
   - Itérer les **stateful** : si plusieurs candidats, tirage pondéré, on en garde **un seul**.
   - Si un stateful est tiré → INSERT `event_instance`, **stop la boucle**, figer `last_recap_at` au début de ce bucket.
   - Sinon, continuer. Au dernier bucket, `last_recap_at = now()`.
3. **Afficher** : liste chronologique des ambient, puis le stateful en attente avec ses boutons.
4. **Tout dans une seule transaction Drizzle.**

> **Transaction** = bloc DB tout-ou-rien. Si l'INSERT de l'`event_instance` foire après application d'un effet ambient (+50 berries), le joueur ne garde pas les berries sans la trace.

Pas de cooldown sur `!recap`. S'il n'y a rien à afficher, on le dit.

## Un seul stateful en attente max

Pendant le rejeu, dès qu'un stateful est tiré on s'arrête. Tant qu'il n'est pas résolu, `!recap` se contente de réafficher. Une fois résolu, `!recap` reprend là où il s'était arrêté.

Rationale : rythme narratif (tu vois → tu décides → tu continues), au lieu de balancer 8 décisions d'un coup.

Si plusieurs stateful candidatent sur **un même bucket** : tirage pondéré par leur `weight`, un seul gagne, les autres skippés pour ce bucket. Le `bucket_id` reste un identifiant fiable du contexte.

**Alternatives écartées :**

- _Plusieurs stateful en parallèle_ : menu de quêtes, plus dur à modéliser, casse la narration linéaire de la mainstory.
- _Tout résolu en un clic_ : perd "tu décides et tu vis avec". Et certains events doivent rester ouverts (combat de mainstory laissé en suspens pour s'équiper).

## Cap 48h

Si retour après 5 jours d'AFK, on cap à 48h avant `now()`. Le reste est perdu.

| Raison      | Détail                                                       |
| ----------- | ------------------------------------------------------------ |
| Performance | 5 jours × 96 buckets/jour = 480, contre 192 à 48h.           |
| Game design | `!recap` raconte le récent, pas le mois de vacances.         |
| Simplicité  | Pas de logique pour "compresser 5 jours en quelques events". |

48h est arbitraire, ajustable.
