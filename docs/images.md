# Images des embeds

Comment on stocke et on sert les images affichées dans les embeds Discord (thumbnail d'un fruit, image principale d'un character, etc.).

## Le flux

Il y a deux choses à garder synchro **à la main** :

1. **Le fichier** dans le repo, sous `/assets/...` (ex: `/assets/devil-fruits/gomu-gomu-no-mi.webp`). À chaque push sur `main`, Cloudflare Pages publie le contenu de ce dossier sur un domaine public.
2. **La colonne `image_url`** en DB, qui contient le chemin **relatif** du fichier (ex: `devil-fruits/gomu-gomu-no-mi.webp`). C'est nous qui l'écrivons via les seeds ou des migrations de données.

Si tu ajoutes une image dans `/assets` mais que tu oublies d'updater l'`image_url` correspondant en DB, l'embed n'affichera rien. L'inverse pareil : un `image_url` qui pointe vers un fichier qui n'existe pas dans `/assets`, Discord renverra une image cassée.

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

| Usage                                                  | Dimension                              | Format                   | Poids cible |
| ------------------------------------------------------ | -------------------------------------- | ------------------------ | ----------- |
| `setThumbnail` (petit carré en haut-droite de l'embed) | **256×256**                            | WebP                     | 15-40 KB    |
| `setImage` statique (gros visuel sous la description)  | **1024×1024** (côté long si non carré) | WebP                     | 80-150 KB   |
| `setImage` animé                                       | **600-800px**, 12-15 fps, 2-3s         | **WebP animé** (PAS GIF) | < 800 KB    |

**Toujours du WebP**, jamais de GIF. Un GIF animé pèse typiquement 5 à 15× plus qu'un WebP animé équivalent, et Discord rend les deux pareil.

## Convention de nommage

- Tout en **kebab-case** : `gomu-gomu-no-mi.webp`, pas `Gomu_Gomu_no_Mi.webp` ni `gomuGomu.webp`
- Un sous-dossier par domaine : `devil-fruits/`, `characters/`, `resources/`
- L'extension correspond au format réel (toujours `.webp` ici)

## À retenir

- Le fichier dans `/assets` ET la valeur en DB sont **deux choses séparées** qu'on garde synchro à la main
- En code : `setImage(buildAssetUrl(template.imageUrl))`, jamais d'URL en dur
- En DB : on stocke le chemin relatif (`devil-fruits/gomu-gomu-no-mi.webp`), pas l'URL complète
- Toujours du WebP, 256² pour thumbnail, 1024² pour setImage, < 800 KB pour un animé
