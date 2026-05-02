# Les concepts

## Les deux états du joueur

À tout moment, un joueur est dans un de ces deux états :

### 1. Ancré sur une île

Le joueur est physiquement quelque part : Alabasta, Drum, East Blue. Sa colonne `zone_presence` actuelle pointe vers cette île. Les événements qui peuvent lui arriver sont **les événements propres à cette île** : croiser un PNJ d'Alabasta, faire un combat de la mainstory, rencontrer un autre joueur présent au même endroit.

C'est l'état par défaut. Si le joueur ne fait rien, il reste ancré indéfiniment. C'est volontaire — ça permet à un joueur de **rester volontairement** quelque part pour farmer des événements rares (tu veux trouver tel objet ? Reste à Jaya, ça finira par tomber).

### 2. En transit (en mer)

Le joueur a quitté une île et fait route vers une autre. Sa colonne `current_zone` pointe vers une mer (par exemple `sea_paradise`). Trois colonnes sur la table `player` racontent le voyage en cours :

- `travel_target_zone` : l'île qu'il vise.
- `travel_started_at` : le moment où il a quitté son île précédente.
- `travel_eta_at` : le moment où il devrait arriver — **ETA** = _Estimated Time of Arrival_, l'heure estimée d'arrivée à destination.

Pendant le transit, il vit des événements en mer : tempêtes, calmes plats, rencontres avec d'autres marins. Au bout d'un certain temps (cf [travel-mechanics.md](./travel-mechanics.md)), il arrive — et bascule en ancré dans la zone de destination.

## Comment on déclenche un départ

**Pas de commande directe**. Pas de menu global "où veux-tu aller ?". À la place, **chaque île a ses propres événements de départ** qui sont des `interactive` du domaine event.

Trois sortes typiques :

### Événements narratifs liés à la mainstory

> _"Vivi te remercie pour Alabasta. Elle te dit que ton équipage devrait reprendre la mer. Que fais-tu ?"_
>
> [Partir vers Drum (Log Pose)] [Partir vers Jaya (Eternal Pose)] [Rester à Alabasta]

Ce genre d'event ne se déclenche qu'une fois (`oneTime: true`), après l'event mainstory clé (ici la défaite de Crocodile).

### Événements ambiants liés au temps passé à quai

> _"Le maître du port d'Alabasta te dit que la marée est bonne. Vos voiles sont prêtes."_
>
> [Partir] [Encore un peu]

Cooldown de quelques heures. Re-déclenché si le joueur reste.

### Événements liés à un item obtenu

> _"Ton Eternal Pose pour Skypiea s'illumine. Tu sens l'appel du ciel."_
>
> [Mettre le cap sur Skypiea] [Pas maintenant]

Déclenché quand l'item entre dans l'inventaire.

> Le **détail des conditions** (pourquoi tel choix est proposé ou pas, comment on calcule la durée du voyage) est dans [travel-mechanics.md](./travel-mechanics.md).

## Comment fonctionne un départ une fois choisi

Quand le joueur clique sur "Partir vers Drum", l'engine fait dans la même transaction :

1. **Bascule la zone** : `recordZoneChange(player, 'sea_paradise')`.
2. **Remplit les colonnes de voyage** sur `player` : `travel_target_zone = 'drum'`, `travel_started_at = now()`, `travel_eta_at = now() + duréeCalculée`.
3. **Trace dans `history`** : `event_type = 'travel.departed'`, payload avec origine, destination, durée estimée.

À partir de là, le joueur est en transit. Les événements en mer peuvent commencer à le concerner.

## Comment on arrive à destination

Tout au long du voyage, à chaque `!recap` l'engine vérifie : `now() >= player.travel_eta_at` ?

Si oui, l'engine génère automatiquement un event d'arrivée :

> _"Tu aperçois Drum à l'horizon. L'île hivernale se découvre devant toi."_

Il bascule la zone du joueur vers `drum`, vide les colonnes `travel_*`, trace `travel.arrived` dans history. Le joueur est maintenant ancré à Drum et peut vivre les événements de cette île.

## Re-routing : changer d'avis pendant le trajet

Pendant le transit, certains événements en mer proposent une **réorientation** :

> _"Tu croises un marchand qui te parle d'un trésor caché à Jaya. Dévier ?"_
>
> [Dévier vers Jaya] [Continuer vers Drum]

Si oui, l'engine recalcule la nouvelle destination et la nouvelle ETA, met à jour les colonnes `travel_*`.

## Dérive : quand ça tourne mal

Si en cours de route les conditions se dégradent (le navigateur a été tué dans une rencontre, un Log Pose volé, etc.), **on continue quand même** — pas question de bloquer le joueur en mer. Mais la qualité du voyage souffre : des événements de **dérive** peuvent te faire arriver à une zone aléatoire au lieu de la destination prévue.

> _"La tempête a emporté ton Log Pose. Vous avez dérivé. Vous arrivez en vue d'une île… ce n'est pas Drum, c'est Little Garden."_

C'est rare (genre 5% par voyage en moyenne) et plutôt amusant qu'punitif.
