# La mécanique du voyage

Comment on calcule combien de temps un trajet prend, ce qui le rend plus rapide, et ce qui peut mal tourner.

## La formule de durée

Quand le joueur part d'une île A vers une île B, l'engine calcule :

```
durée = baseDurationBuckets × shipFactor × (1 - navigatorBonus) × dériveFactor
```

Concrètement, pour chacun :

| Variable              | D'où ça vient                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `baseDurationBuckets` | Définie sur l'arête du graphe. Ex: `alabasta → drum = 30 buckets` (~7h30 réels).         |
| `shipFactor`          | Stat du navire. 1.0 par défaut, 0.7 si Going Merry amélioré, 0.5 pour un Marine warship. |
| `navigatorBonus`      | Si un navigator est dans l'équipage. 0.0 sans nav, jusqu'à 0.4 avec un Nami niveau 10.   |
| `dériveFactor`        | 1.0 normalement. Multiplié si on est sans navigator (×1.5) ou par mauvais temps (×1.2).  |

Exemple concret :

> Trajet Alabasta → Drum, base 30 buckets.
> Tu as un Going Merry amélioré (`shipFactor = 0.85`), tu as Nami niveau 5 (`navigatorBonus = 0.2`), pas de mauvais temps (`dériveFactor = 1.0`).
> → durée = 30 × 0.85 × 0.8 × 1.0 = **20.4 buckets** ≈ 5h.

Sans navigateur :

> Même trajet, mais sans nav.
> → durée = 30 × 0.85 × 1.0 × 1.5 = **38.25 buckets** ≈ 9h30.

## Les conditions pour partir

Chaque arête du graphe peut déclarer des **conditions**. Il y en a deux sortes.

### Conditions hard (obligatoires)

Si la condition n'est pas remplie, **le voyage est impossible**. Le choix n'apparaît même pas dans le menu de départ.

Exemples :

- Pour aller d'East Blue à Reverse Mountain : aucune condition, c'est ouvert à tous.
- Pour aller de Reverse Mountain à Whisky Peak : il faut un **Log Pose** dans l'inventaire (sinon les boussoles ne marchent pas dans le Grand Line).
- Pour aller à Skypiea : il faut un **Eternal Pose Skypiea** (ou avoir vécu l'événement Knock-Up Stream à Jaya).

### Conditions soft (modificateurs)

La destination reste accessible, mais ça **coûte plus cher** : voyage plus long, dérive plus probable.

Exemples :

- Pas de navigateur dans l'équipage : `dériveFactor × 1.5` (durée +50%, risque de dérive plus élevé).
- Météo orageuse à ce moment du jeu : `shipFactor × 1.3`.
- Navire endommagé : `shipFactor × 1.4`.

> **Pourquoi distinguer hard et soft ?** Pour pouvoir dire "tu peux y aller, mais à tes risques" sans bloquer le joueur. Le hard sert aux contraintes physiques (boussole obligatoire), le soft aux contraintes de qualité (équipage, navire).

## Si les conditions changent en cours de route

Le joueur part d'Alabasta vers Drum. Au milieu du voyage, il subit une rencontre où il **perd Nami** (capturée). Que se passe-t-il ?

**Réponse simple : on continue.** On ne re-vérifie pas les conditions une fois en mer. Le joueur arrive quand même à destination, juste plus tard si on recalcule la `dériveFactor` à la volée (futur — pour l'instant, durée figée au départ).

> **Pourquoi ce choix ?** Parce qu'arrêter le joueur en pleine mer pour lui dire "tu n'as plus de navigateur, tu es bloqué" serait nul. Mieux vaut qu'il continue et compose avec.

## Combien d'événements en mer pendant un trajet ?

Pour que le voyage **se ressente** sans submerger le joueur, on calibre :

| Cadence                                   | Détail                                                       |
| ----------------------------------------- | ------------------------------------------------------------ |
| Event en mer (tempête, calme, rencontre…) | ~1 par 15 buckets (~3h45)                                    |
| Event "rebond" qui propose un re-routing  | ~1 par 30 buckets (~7h30), proba basse                       |
| Event d'arrivée                           | Une fois quand `now() >= player.travel_eta_at`, automatique. |

Sur un trajet de 30 buckets, ça donne **2 events en mer + 1 arrivée** en moyenne. Suffisant pour avoir l'impression de naviguer, sans noyer le joueur de notifications.

## La dérive : quand on arrive ailleurs

Sur 5% des voyages environ, le joueur n'arrive pas à destination — il dérive. L'engine choisit aléatoirement (seed `at_sea_*` + bucket d'arrivée) une **autre île atteignable de la même région** et bascule la zone vers celle-là.

> _"La tempête a soufflé toute la nuit. Quand le calme revient, tu reconnais une côte… ce n'est pas Drum, c'est Little Garden."_

Pas de pénalité supplémentaire — juste arrivée ailleurs. Le joueur peut alors décider de repartir vers la destination initiale (depuis cette nouvelle île).

> **Important :** la dérive ne te fait jamais arriver dans une zone où tu ne pourrais pas aller normalement (pas de Skypiea par dérive si tu n'as pas un Eternal Pose). Ça reste réaliste : tu dérives vers le **plus proche atteignable**.

## Récap visuel d'un voyage typique

```
Bucket 0   : choix "Partir vers Drum" → bascule en at_sea_paradise, ETA fixée à bucket 30
Bucket 8   : event "Calme plat. L'équipage en profite pour pêcher (+50 berries)."
Bucket 17  : event "Tempête. -1 moral."
Bucket 24  : event "Tu croises un navire marchand. [Discuter] [Ignorer]"
Bucket 30  : event "Tu aperçois Drum à l'horizon." → bascule en zone drum
```
