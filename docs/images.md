# Images des assets

Comment on stocke et on sert les images des entités du jeu (fruits, persos, ressources…) — à la fois pour l'affichage direct (dans !info par exemple) et pour composer les images dynamiquement (!inventaire ..., avatar de discussion)

## Deux variantes par asset

Chaque asset vit dans son propre dossier et peut contenir plusieurs fichiers :

```
assets/
  resources/
    wood/
      info.webp     ← visuel principal, affiché dans !info
      icon.webp     ← petite icône, utilisée par le moteur graphique (grille d'inventaire, etc.)
    iron/
      info.webp
      icon.webp
  devil-fruits/
    gomu-gomu-no-mi/
      info.webp
      icon.webp
      avatar.webp <-- utilisé pour un perso qui parle par exemple
```

## Le flux

Il y a deux choses à garder synchro **à la main** :

1. **Les fichiers** dans le repo, sous `/assets/...` (ex: `/assets/devil-fruits/gomu-gomu-no-mi/info.webp`). À chaque push sur `main`, Cloudflare Pages publie le contenu de ce dossier sur un domaine public.
2. **La colonne `image_url`** en DB, qui contient le chemin **relatif** du dossier de l'asset (ex: `devil-fruits/gomu-gomu-no-mi`). C'est nous qui l'écrivons via les seeds ou des migrations de données.

Si tu ajoutes des images dans `/assets` mais que tu oublies d'updater l'`image_url` correspondant en DB, l'embed n'affichera rien. L'inverse pareil : un `image_url` qui pointe vers un dossier qui n'existe pas dans `/assets`, Discord renverra une image cassée.

## Comment c'est utilisé en code

Quand on rend un embed, on lit l'`imageUrl` de la row, on le passe à `buildAssetUrl`, on récupère une URL absolue :

```ts
import { buildAssetUrl } from '../../shared/build-asset-url.js';

if (template.imageUrl) {
  embed.setThumbnail(buildAssetUrl(template.imageUrl));
}
```

`buildAssetUrl(template.imageUrl)` concatène simplement la base URL (configurée dans `apps/bot/.env.local`) avec le chemin :

```
ASSETS_BASE_URL  +  '/'  +  'devil-fruits/gomu-gomu-no-mi.webp'

→ https://162713d0.discord-bot-one-piece.pages.dev/devil-fruits/gomu-gomu-no-mi.webp
```

L'URL est construite **au runtime**, pas au build. Avantage : on peut pointer vers un autre déploiement (preview Cloudflare, mock local) en changeant juste `ASSETS_BASE_URL`, sans toucher au code ni à la DB.

## Règles de format

| Fichier             | Usage                                               | Dimension                              | Format                   | Poids cible |
| ------------------- | --------------------------------------------------- | -------------------------------------- | ------------------------ | ----------- |
| `info.webp` (thumb) | `setThumbnail` (petit carré en haut-droite)         | **256×256**                            | WebP                     | 15-40 KB    |
| `info.webp` (full)  | `setImage` (gros visuel sous la description)        | **1024×1024** (côté long si non carré) | WebP                     | 80-150 KB   |
| `info.webp` animé   | `setImage` animé                                    | **600-800px**, 12-15 fps, 2-3s         | **WebP animé** (PAS GIF) | < 800 KB    |
| `icon.webp`         | Composition par le moteur graphique (inventaire, …) | **128×128**, fond transparent          | WebP                     | 3-10 KB     |

| `avatar.webp` a décidé..

**Toujours du WebP**, jamais de GIF. Un GIF animé pèse typiquement 5 à 15× plus qu'un WebP animé équivalent, et Discord rend les deux pareil.

## Convention de nommage

- Slug du dossier en **kebab-case** anglais : `gomu-gomu-no-mi/`, `wood/`, `iron/`, pas `Gomu_Gomu_no_Mi/` ni `bois/` ni `gomuGomu/`
- Un sous-dossier par domaine : `devil-fruits/`, `characters/`, `resources/`
- Un sous-dossier par asset à l'intérieur, contenant `info.webp` (obligatoire), si objet : `icon.webp`, etc..
- L'extension correspond au format réel (toujours `.webp` ici)

## À retenir

- Un asset = un dossier qui contient forcément `info.webp` + d'autres trucs selon le contexte (icon.webp, avatar.webp etc)
- Les fichiers dans `/assets` ET la valeur en DB sont **deux choses séparées** qu'on garde synchro à la main
- En code : `setImage(buildAssetUrl(\`${template.imageUrl}/info.webp\`))`, jamais d'URL en dur
- En DB : on stocke le chemin relatif du **dossier** (`devil-fruits/gomu-gomu-no-mi`), pas l'URL complète ni le `.webp` final
- Toujours du WebP : 256² pour thumbnail, 1024² pour setImage, 128² pour icon, < 800 KB pour un animé

## Conversion automatique au commit

Pas besoin de convertir à la main : si tu stage un fichier `.png`, `.jpg` ou `.jpeg` sous `/assets/`, un hook pre-commit l'optimise pour toi :

- resize à 1024² max (côté long, ratio gardé) si l'image est plus grande
- encode WebP en cherchant la qualité la plus haute qui rentre sous 150 KB (essaie 90 → 85 → 80 → 75 → 70 ; s'arrête au premier palier qui passe)
- supprime l'original et le remplace par `.webp` dans le commit

Tu peux relancer la conversion manuellement : `pnpm images:optimize` (agit sur ce qui est staged).

Cas hors scope du hook : animés (GIF/MP4) — convertis-les à la main pour l'instant.
