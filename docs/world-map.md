# La carte du monde

La commande `!ship` affiche une carte avec la position du navire, pour que le joueur suive son trajet. Cette doc explique comment cette carte est construite et où intervenir pour la faire évoluer. (Le moteur d'images générique, lui, est documenté dans [image-builder.md](./image-builder.md).)

## Le principe

Le fond de carte est cher à produire et ne change jamais entre deux déploiements. La position du navire change tout le temps mais coûte trois fois rien. Donc :

- le **fond** est rendu **une seule fois au lancement du bot** et gardé en mémoire ;
- à chaque `!ship`, on ne fait que **cropper** une fenêtre autour du navire et poser un marqueur dessus.

```
au lancement (1 fois)
  world-positions.ts    → un point {x, y} par île (unités « monde »)
  build-world-map.ts    → SVG écrit à la main → PNG en mémoire (worldMapPng)

à chaque !ship
  build-ship-card.tsx   → position du marqueur (à quai : l'île ; en mer : interpolation départ → cible)
  viewport.ts           → crop 800×450 centré sur le marqueur, clampé aux bords (sharp.extract)
  build-ship-card.tsx   → crop + brume + trajet en pointillés + marqueur (satori)
```

L'origine d'un voyage vient de `player.travelStartZone`, écrite par `startTravel` et vidée à l'arrivée — pas de lookup en history.

## D'où viennent les positions des îles

Personne ne place les îles à la main pixel par pixel. `world-positions.ts` part de positions manuelles approximatives (la « graine »), puis un MDS (`mds-layout.ts`) ajuste les distances pour qu'elles reflètent les durées de voyage réelles en buckets : deux îles à 2 buckets l'une de l'autre paraissent proches, deux îles à 10 buckets paraissent loin. La Grand Line est une rangée horizontale sous East Blue, dans l'ordre de progression. Tout est déterministe et calculé au chargement.

## Le zoom

La card affiche une fenêtre fixe de 800×450 (`VIEWPORT_WIDTH/HEIGHT` dans `viewport.ts`). Le niveau de zoom ne se règle **pas** là : il se règle avec `MAP_WIDTH` dans `build-world-map.ts`. Plus la carte est rendue large, plus la fenêtre de 800px en montre une petite portion — à 3200, la card montre 1/4 de la carte. Le fond étant rendu à la bonne taille dès le départ, le crop est net, jamais agrandi.

## Les textures et les nuages

Le fond est programmatique, dans son SVG (`buildBackgroundSvg`) : dégradé d'océan, motif de vagues, halos de haut-fonds et ombres sous les îles. Les nuages procéduraux (`clouds.ts`) habillent les bords du monde (« terra incognita », cuits dans le fond). Ils sont déterministes : pas de `Math.random`, même carte à chaque lancement.

Les bords de chaque card portent en plus une frame de nuages dessinée (`assets/world/clouds.webp`), agrandie et recadrée au centre (`VIGNETTE_OVERSCAN` dans `viewport.ts`) pour ne garder qu'une bordure fine — pré-rendue une fois au lancement.

Le jour où on veut de vrais assets (parchemin, îles dessinées), ça se remplace **uniquement dans `buildBackgroundSvg`** — le viewport et la card ne voient qu'un PNG, rien d'autre ne bouge.

## Architecture

```
apps/bot/src/domains/navigation/world-map/
  world-positions.ts   ← un point par île — la source de vérité des deux rendus
  mds-layout.ts        ← la mécanique de layout (Floyd-Warshall, SMACOF, anti-chevauchement)
  palette.ts           ← les couleurs, partagées avec pnpm world
  clouds.ts            ← nuages procéduraux des bords du monde (helpers purs)
  build-world-map.ts   ← le fond : SVG à la main → PNG, rendu une fois au lancement
  viewport.ts          ← le crop zoomé + la frame de nuages des cards
```

## pnpm world et la card : qui partage quoi

`pnpm world` (cytoscape, dans le navigateur) et la card partagent les **données** : positions (`world-positions.ts`), couleurs (`palette.ts`), graphe (packages/db). Ils ne partagent **pas** le renderer : cytoscape d'un côté, SVG maison de l'autre — c'est voulu, l'un est un outil de debug de topologie, l'autre un rendu joueur. C'est aussi pour ça que `pnpm world` n'a pas les textures : les y porter reviendrait à les réimplémenter en style cytoscape, de la duplication pour un outil de dev.

## Points importants

- **Cas à connaître** : pendant un voyage, `player.currentZone` est la **mer** — l'île de départ vit dans `travelStartZone`. Une bifurcation change la cible mais pas le départ : la route repart de l'île d'origine.
- **Piège satori** : `overflow: hidden` est appliqué sur la boîte **avant** `transform: rotate` — une div tournée qui déborde se fait tronquer au mauvais endroit. C'est pour ça que le trajet est dessiné en points posés en absolu (pas de div rotatée), clippés mathématiquement au cadre (cf `clipRouteToViewport`).
- **Coût à l'import** : `worldMapPng` est rendu au chargement du module. Tout script qui importe (même indirectement) `build-world-map.ts` paie ~1 s de rendu — voulu pour le bot, piège pour un petit script CLI.
- **resvg et les fonts** : le SVG à la main contient du `<text>`, donc `rasterizeSvg` reçoit le chemin du `.ttf` (satori n'en a pas besoin, il convertit le texte en paths).
