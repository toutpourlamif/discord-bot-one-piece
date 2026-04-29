# Domaine : player

## Concept

Le **joueur** est le compte Discord et sa progression globale. C'est le point d'entrée de toute action — un joueur possède un navire (voir `ship`), un équipage (voir `crew`), une réserve de personnages (voir `character`), des ressources (voir `resource`), et un solde de Berry (voir `economy`).

## Player vs PlayerAsCharacter

Le `player` (table) tient ce qui est **compte-level** : identité Discord, bounty, karma, progression globale.

Le joueur **existe aussi comme personnage dans le monde** : c'est le **PlayerAsCharacter** (voir `character`). Tout ce qui est "trucs qu'un perso a" — race, Fruit du Démon, stats, équipement — vit sur ce `character_instance`, **pas** sur `player`. Ça évite de dupliquer chaque feature des personnages côté player.

À la création d'un player (`findOrCreatePlayer`), son PlayerAsCharacter est créé dans la même transaction. Quand le joueur se rename, le `nickname` du PlayerAsCharacter est mis à jour pour rester cohérent avec son nom affiché.

## Bounty

La prime mise sur la tête du joueur par le Gouvernement Mondial, exprimée en Berry.

Gagné via :

- events `main_story` marquants,
- `side_quest` réussies,
- victoires contre personnages notoires (Marines haut gradés, pirates rivaux…).

Le bounty sert de seuil d'accès aux events d'envergure — Yonko, Mary Geoise, Seven Warlords, QG Marine…

## Karma

Alignement moral, d'**infâme** à **héroïque**. Qualitatif, évolue selon les choix faits pendant les events.

- **Infâme** — pillage, trahison, domination. Ouvre la voie des pirates sombres type Barbe Noire
- **Héroïque** — libération de peuples opprimés, sauvetage de civils, alliance avec les Révolutionnaires, Choix gentils

Un karma donné peut être **requis** pour débloquer un event (ex: rencontre avec Dragon exige un karma héroïque) ou au contraire le **bloquer**.

Bounty et karma sont **indépendants** : un joueur peut cumuler bounty énorme + karma héroïque (type Luffy) ou bounty élevé + karma infâme (type Crocodile).
