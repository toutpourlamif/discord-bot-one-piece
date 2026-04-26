# Recherche par nom (commande !info)

Comment on cherche une entité quand le user tape une query (`!info luffy`, etc.).

## Ce qu'on veut

Que ça marche même quand c'est moche :

- `luffy` → "Luffy"
- `lufy` → "Luffy" (typo)
- `gomu` → "Gomu Gomu no Mi" (bout du nom)
- `GOMU` → "Gomu Gomu no Mi" (casse)

## Comment

Deux trucs combinés : la similarité trigram de `pg_trgm`, et un `ILIKE` classique en filet.

Le trigram, ça tolère les typos. Mais ça a besoin d'au moins 3 caractères pour bosser (vu qu'un trigram, par définition, c'est 3 lettres). Donc pour les queries courtes (`mi`, `no`…), il laisse passer. D'où le `ILIKE` qui rattrape.

En SQL ça donne :

```sql
SELECT *
FROM devil_fruit_template
WHERE name % $1 OR name ILIKE $2
ORDER BY similarity(name, $3) DESC
LIMIT 25;
```

Côté Drizzle :

```ts
db.select()
  .from(table)
  .where(or(sql`${table.name} % ${query}`, ilike(table.name, `%${query}%`)))
  .orderBy(sql`similarity(${table.name}, ${query}) desc`)
  .limit(25);
```

## Ce qui doit exister côté DB

- L'extension `pg_trgm` (déjà activée, migration `0003`).
- Un index GIN sur chaque colonne qu'on veut chercher :
  ```ts
  index('<table>_name_trgm_idx').using('gin', sql`${table.name} gin_trgm_ops`);
  ```
  Sans l'index, ça marche quand même mais ça scan toute la table — à éviter dès qu'il y a du volume.

## Score retourné

Les `searchManyByName` des repos ne renvoient pas que les entités, ils renvoient aussi le `score` de similarité (le float entre 0 et 1 que Postgres calcule via `similarity(name, query)`). On l'expose en sélectionnant la colonne en plus des champs de la table, puis on map vers `{ entity, score }`.

À quoi ça sert : la commande `!info` interroge plusieurs domaines en parallèle (fruit, ressource, …) et a besoin d'un critère commun pour merger les résultats inter-domaines. Le score donne ce critère : on flatten, on trie par score décroissant, on cap au top 5.

Note : un résultat qui matche **uniquement** par `ILIKE` (pas par trigram) aura un score très bas, voire 0. C'est OK — il ressort en bas du classement et ne pollue pas le top.

## Règles côté commande

- Query vide ou < 2 caractères → on refuse côté handler (pas au niveau du repo). Sinon on renvoie n'importe quoi.
- Max 25 résultats, c'est la limite des boutons/select menus Discord. Si on dépasse, le user affine.

## Piège connu

Si la query contient `%` ou `_`, ILIKE les prend comme wildcards. C'est pas un risque sécurité — les params sont bindés — mais la recherche peut retourner trop large. Aucun nom One Piece connu n'a ces caractères, donc YAGNI.

## Injection SQL

Safe. Drizzle bind tout ce qu'on interpole dans `sql\`...\``et dans`ilike(...)`. Les queries partent en prepared statement (`$1`, `$2`…), pas en string concaténée.
