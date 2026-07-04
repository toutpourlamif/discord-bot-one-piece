# Parse Emotion Sheet

## Objectif

Decouper une emotion sheet de personnage en fichiers `dialogue-<emotion>.webp` pour les dialogues Discord.

Le prompt de generation n'est pas stocke dans le repo. Utiliser la version partagee sur Discord pour eviter de garder un prompt obsolete ici.

## Ordre de la grille

La sheet doit etre une grille reguliere `2 lignes x 3 colonnes`, lue de gauche a droite puis de haut en bas.

`pnpm parse-emotion-sheet` utilise uniquement ce format, detecte les panneaux de la grille, retire les gouttieres claires, puis recadre automatiquement chaque portrait autour du personnage.

| Case | Emotion    |
| ---- | ---------- |
| 1    | `happy`    |
| 2    | `crying`   |
| 3    | `scared`   |
| 4    | `laughing` |
| 5    | `thinking` |
| 6    | `angry`    |

L'outil genere aussi `dialogue-default.webp` en copiant l'emotion choisie dans le champ `Default`.

## Exemple d'utilisation

1. Generer une emotion sheet avec le prompt partage sur Discord.
2. Lancer `pnpm parse-emotion-sheet`.
3. Choisir le dossier du personnage.
4. Choisir l'emotion qui servira de `dialogue-default.webp`.
5. Uploader la sheet ou la coller directement avec `Ctrl+V`.
6. Verifier les portraits decoupes, puis generer les fichiers.
