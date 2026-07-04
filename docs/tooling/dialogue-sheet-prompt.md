# Dialogue Sheet Prompt

## Objectif

Generer une seule image contenant les portraits de dialogue d'un personnage, puis la decouper avec `pnpm dialogue-image` en fichiers `dialogue-<emotion>.webp`.

## Ordre de la grille

La sheet doit etre une grille reguliere `2 lignes x 3 colonnes`, lue de gauche a droite puis de haut en bas.

`pnpm dialogue-image` utilise uniquement ce format, detecte les panneaux de la grille, retire les gouttieres claires, puis recadre automatiquement chaque portrait autour du personnage.

| Case | Emotion    |
| ---- | ---------- |
| 1    | `happy`    |
| 2    | `crying`   |
| 3    | `scared`   |
| 4    | `laughing` |
| 5    | `thinking` |
| 6    | `angry`    |

L'outil ne genere pas `dialogue-default.webp`. Il genere uniquement les six expressions demandees par le prompt.

## Prompt

```text
Je vais te fournir le character sheet d'un personnage.

Genere UNE SEULE image de dialogue-sheet pour ce personnage, en respectant strictement ces contraintes :

- Format : grille reguliere 2 lignes x 3 colonnes.
- Chaque case doit avoir exactement la meme taille.
- Les portraits doivent etre centres, cadrage buste/visage, meme orientation et meme distance camera dans toutes les cases.
- Style photo de profil pour bulle de dialogue Discord, proche du cadrage des fichiers `dialogue-*.webp` existants du projet.
- Conserve le style graphique, la palette, les vetements, les traits du visage et les accessoires du character sheet source.
- Fond uni clair ou transparent, identique dans toutes les cases.
- Aucun texte, aucune etiquette, aucun cadre, aucune separation visible entre les cases.
- Expressions faciales lisibles et distinctes.
- Ordre obligatoire des cases, de gauche a droite puis de haut en bas :
  1. happy : sourire franc
  2. crying : triste, larmes visibles
  3. scared : effraye, yeux ouverts, tension visible
  4. laughing : rire ouvert, energie joyeuse
  5. thinking : pensif, regard reflechi
  6. angry : en colere, sourcils fronces

La sortie doit etre une image unique, propre, parfaitement alignee, directement decoupable en 6 cases egales.
```

## Exemple d'utilisation

1. Charger le character sheet du personnage dans ChatGPT avec generation d'images.
2. Coller le prompt ci-dessus.
3. Telecharger l'image generee.
4. Lancer `pnpm dialogue-image`.
5. Choisir le dossier du personnage, uploader la sheet, verifier la preview, puis generer les fichiers.
