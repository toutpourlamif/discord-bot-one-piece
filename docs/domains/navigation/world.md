# Monde et graphe de navigation

## Vue d'ensemble

Le monde est modélisé avec deux familles de zones :

- `Island` : une zone terrestre où le joueur peut arriver, interagir et déclencher du contenu.
- `Sea` : une mer traversée pendant un voyage.

Un voyage part toujours d'une île vers une île. La mer n'est pas une destination : elle sert de transit (`via`) pour les événements de navigation.

```txt
East Blue ──→ Reverse Mountain ──→ Paradise ──→ New World
      │              │                  │
   îles locales   entrée GL        Log Pose requis
```

Pour la V1, on remplit surtout East Blue et le début de Paradise. Les autres régions sont prévues dans le modèle, mais ne sont pas toutes jouables.

## Source de vérité

La donnée du monde vit dans `packages/db/src/domains/navigation/world`.

- Les îles sont déclarées avec `defineIsland`.
- Les îles d'East Blue vivent dans `islands/east-blue`.
- `islands/east-blue/registry.ts` expose `EAST_BLUE_ISLAND_REGISTRY`.
- `islands/registry.ts` agrège les registres d'îles.
- `islands/east-blue/edges.ts` expose `EAST_BLUE_EDGES`.
- `edges.ts` agrège les arêtes du monde.
- `zones.ts` expose `ISLANDS`, `SEAS` et `ZONES`.

Le code est la source exhaustive. Cette doc sert à comprendre le modèle et les grands regroupements sans relire toute la liste brute.

## East Blue

East Blue est découpé en arcs lisibles. Les couleurs de `pnpm world` suivent ces groupes.

| Groupe | Rôle                                                                                    |
| ------ | --------------------------------------------------------------------------------------- |
| Bleu   | Arc Luffy / Zoro : Dawn, Yotsuba et leurs routes proches.                               |
| Orange | Nami / Buggy le clown : Organ, Mirrorball, Nagagutsu, Kumate, Sixis et routes voisines. |
| Rouge  | Ussop / Kuro : archipel Gecko.                                                          |
| Vert   | Sanji : Baratie.                                                                        |
| Noir   | Arlong Park : archipel de Conomi et îles voisines.                                      |
| Or     | En route vers Grand Line : Oykot, Pole Star, puis Reverse Mountain.                     |
| Violet | Villes ou îles annexes reliées au cluster principal.                                    |

Les routes d'East Blue sont volontairement locales : chaque île est reliée à ses voisines proches pour obtenir un graphe navigable, lisible, et assez dense sans devenir une toile complète.

## Paradise

Paradise est plus linéaire par défaut, parce qu'il dépend du Log Pose.

```txt
Reverse Mountain ──→ Whisky Peak ──→ Little Garden ──→ Drum ──→ Alabasta
```

Les routes Paradise nécessitent le Log Pose. L'objectif est de garder la sensation de périple : on avance d'île en île, sauf cas particulier débloqué plus tard par un Eternal Pose.

## Log Pose

Dans le Grand Line, les boussoles classiques ne suffisent plus. Le joueur suit un Log Pose pour atteindre la prochaine île du rail principal.

Concrètement :

- Sans Log Pose, pas de navigation dans Paradise.
- Avec un Log Pose, la route principale devient disponible.
- Le Log Pose reste un item permanent.

## Eternal Pose

Un Eternal Pose est verrouillé sur une île précise. Quand le joueur en possède un, il peut viser cette île depuis la même grande région, même si la route naturelle passerait par d'autres étapes.

Ça permet de revenir ou de skipper une portion sans casser la mainstory : les événements one-time se déclenchent quand le joueur arrive sur l'île concernée.

## Ajout d'une île

Pour ajouter une île, il faut généralement :

1. Créer sa déclaration avec `defineIsland`.
2. L'ajouter au registry de sa région.
3. Ajouter ses arêtes dans le fichier `edges` de sa région.
4. Vérifier les textes et générateurs dépendants de `Zone`.
5. Générer la migration de l'enum.
6. Lancer `pnpm world` pour vérifier le graphe.

Les types `TravelCondition` et `TravelModifier` sont décrits dans [travel-mechanics.md](./travel-mechanics.md).
