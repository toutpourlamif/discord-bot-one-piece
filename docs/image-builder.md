# Rendu des images

Pour améliorer l'expérience utilisateur, on génère des images au lieu de simplement afficher du texte dans les embeds.

Par exemple, la commande `!inventaire` affichera une image avec toutes les icônes des objets, au lieu d'afficher « Bois x64 », « Tissu x10 », etc. La commande `!crew` affichera une image stylée avec tous les personnages de l'équipage.

Cependant ça impose des contraintes d'architecture, car ce n'est pas quelque chose de simple à faire : on ne peut pas pré-créer toutes les combinaisons possibles d'images, ça demanderait un volume énorme de données. Exemple : rien que pour disposer 10 personnages dans un ordre donné, il y a 10! arrangements possibles, soit ~3,6 millions d'images. Et ça, c'est pour seulement 10 personnages.

Donc il faut générer les images **à la volée** : quand un joueur fait `!crew`, on génère son image du crew à ce moment-là, et on lui envoie.

Ça pose trois questions : comment envoyer une image ? Comment générer une image ? Comment composer stylistiquement une image (si je veux que son personnage 1 fasse 30 pixels de large, etc.) ?

## Envoyer une image

Super simple, deux méthodes :

- soit l'image est **déjà hébergée sur internet**, et on passe son URL : `embed.setImage(url)`. C'est ce qu'on fait déjà pour les assets statiques (voir [images.md](./images.md)) ;
- soit on attache **un fichier binaire** directement au message, via `AttachmentBuilder` :

```ts
import { AttachmentBuilder } from 'discord.js';

const file = new AttachmentBuilder(buffer, { name: 'crew.png' });
embed.setImage('attachment://crew.png'); // référence le fichier attaché par son nom
await message.channel.send({ embeds: [embed], files: [file] });
```

Dans notre cas, vu qu'on génère à la volée, on ne peut pas héberger au préalable. Donc on génère le fichier en mémoire et on l'attache à l'embed. « En mémoire » = un `Buffer` : l'objet Node.js qui contient des octets bruts — c'est le contenu d'un fichier, sans fichier. L'image n'est jamais écrite sur le disque, elle vit en RAM le temps d'être envoyée à Discord. Zéro infra : Discord héberge lui-même le fichier sur son CDN une fois uploadé. La limite de taille (10 MB) est très loin de nous concerner, une carte PNG pèse 200–400 KB.

## Générer une image

On assemble l'image en mémoire à partir de briques qu'on a déjà : les `icon.webp` des assets, du texte, des formes. Trois libs se partagent le travail :

| Lib               | Rôle                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| `satori`          | Transforme un layout décrit en JSX (comme une page web) en SVG                 |
| `@resvg/resvg-js` | Rasterise le SVG en PNG (le `Buffer` final qu'on attache)                      |
| `sharp`           | Décode/convertit/resize les webp sources avant de les embarquer dans le layout |

Le pipeline complet :

```
données métier (crew, inventaire…)
  → layout JSX            (satori)
  → SVG                   (satori)
  → PNG en Buffer         (resvg)
  → AttachmentBuilder     (discord.js)
```

## Composer stylistiquement une image

C'est là que satori brille : on décrit la carte **comme une page web**, en JSX avec du flexbox. Si je veux que le personnage 1 fasse 30 pixels de large, j'écris `width: 30`. Une grille de portraits, c'est un `display: flex` avec `flexWrap`. Pas de dessin pixel par pixel, pas de calculs de coordonnées à la main.

```tsx
<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
  {crew.map((character) => (
    <img src={character.iconDataUri} width={128} height={128} />
  ))}
</div>
```

À savoir : satori ne voit **pas les fonts système** — il faut embarquer nos `.ttf`/`.otf` dans `assets/fonts/` et les charger au démarrage. C'est aussi un avantage : la carte rend exactement pareil sur toutes les machines.

## Architecture

Le moteur est de l'infra générique, les templates sont du formatage de données métier — chaque domaine possède ses cartes, comme il possède déjà ses `build-*-embed.ts` :

```
apps/bot/src/
  image-builder/               ← moteur générique, aucun savoir métier
    build-image.ts             ← buildImage(element, options) → Promise<Buffer>
    rasterize-svg.ts           ← SVG → PNG retina (utilisé par buildImage, et en direct pour du SVG écrit à la main)
    fonts.ts                   ← chargement des fonts au démarrage (une fois)
    load-asset-data-uri.ts     ← lecture des assets du disque + cache mémoire
    components/                ← primitives réutilisables (extraites au 2e usage, pas avant)
  domains/crew/cards/
    build-crew-card.tsx        ← le layout JSX de la carte !crew
  domains/navigation/world-map/  ← la carte du monde (sa propre doc : world-map.md)
  domains/ship/cards/
    build-ship-card.tsx        ← barre de HP + carte du monde avec la position du navire
```

Le fond de carte du monde est le cas particulier : du SVG écrit à la main (plus simple qu'en flexbox pour des lignes/cercles/labels) passé directement à `rasterize-svg`, généré une seule fois au lancement. Tout le détail (positions, zoom, textures, nuages) est dans [world-map.md](./world-map.md).

Points importants :

- **Les assets sont lus depuis le disque** (`/assets` du repo), pas fetchés depuis le CDN — le bot tourne dans le repo, le réseau ne sert à rien ici. Les webp décodés sont gardés en cache mémoire : on paie le décodage une seule fois.
- **Pas de workers pour l'instant.** La génération bloque l'event loop ~50–150 ms, invisible à notre échelle. Le jour où ça devient un problème, on déplace l'implémentation de `buildImage` dans un worker pool (`piscina`) **sans changer la signature ni aucun appelant** — c'est exactement pour ça qu'on isole tout derrière cette frontière.
- **Rendre en 2×** : une carte logique de 800×450 est rendue en 1600×900, sinon c'est flou sur écrans retina.
- **`channel.sendTyping()`** avant la génération dans le handler : l'utilisateur voit « est en train d'écrire… » pendant la demi-seconde de génération + upload.

## Cache des rendus

À notre échelle, on ne cache **aucun rendu** au départ — seulement les assets décodés. Certaines cartes seront très dynamiques (barres de HP, niveaux), d'autres très stables (`!crew` entre deux recrutements). Le jour où une carte stable est spammée, on ajoute un cache `Map<hashDesInputs, Buffer>` dans son `build-*-card` à elle, sans toucher au moteur. Décision locale par template, jamais globale.

## Résultats du spike

- satori ne décode **pas le webp** : `assets.ts` convertit donc en png via `sharp` au chargement — coût payé une seule fois grâce au cache d'assets.
- Fonts déposées dans `assets/fonts/` : **Pirata One** (titres, style pirate) et **Lato** regular/bold (texte courant). Licences libres (OFL).
- Latence mesurée (carte 800×300, 4 portraits) : ~1,2 s **à froid** — premier rendu après démarrage, init de sharp + décodage des assets — puis **~130 ms à chaud**. Largement dans le budget.
