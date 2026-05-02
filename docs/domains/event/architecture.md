# Architecture

Trois piliers : **lazy**, **buckets**, **seed déterministe**. Permettent un monde partagé sans cron ni table d'encounter centrale.

## 1. Lazy : tout est calculé au `!recap`

Aucun job en background. Tant que personne ne joue, le bot dort. `!recap` calcule à la volée tout ce qui aurait pu arriver depuis `last_recap_at`.

| Bénéfice          | Détail                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| Coût d'infra zéro | 90% des joueurs Discord sont AFK à un instant T.                           |
| Pas de scheduler  | Rien à déployer, rien à monitorer.                                         |
| Pas de catch-up   | Si le bot est down 4h, `!recap` recompute toujours depuis `last_recap_at`. |
| Local dev trivial | Un terminal, le bot reste cohérent.                                        |

Trade-off accepté : moins de "le monde tourne pendant que je regarde pas" — compensé par le seed déterministe (même résultats pour tous, voir plus bas). Events à péremption stricte (vente flash 30 min) moins naturels — pas un besoin pour ce jeu.

## 2. Buckets de 15 min

Le temps est découpé en tranches fixes de 15 min.

```
12h00 ── A ── 12h15 ── B ── 12h30 ── C ── 12h45 ...
```

```ts
bucket_id = Math.floor(Date.now() / 1000 / 900);
```

Entier 64 bits, indexable, comparable, sans fuseau horaire.

| Levier                | Effet                                      |
| --------------------- | ------------------------------------------ |
| Coût recap            | Cap 48h → 192 buckets, gérable.            |
| Densité de rencontres | Trop court = jamais ; trop long = floues.  |
| Granularité ressentie | "À 14h00 t'as croisé Hakim" reste lisible. |

15 min est un compromis tunable (constante).

**Sans buckets**, on perd soit les rencontres (timestamps désalignés joueur par joueur), soit le lazy (retour au cron tick).

## 3. Seed déterministe

Pour chaque `(bucket, zone)` :

```ts
seed = hash(bucket_id, zone_id);
rng = seedRng(seed);
```

Le `rng` décide de tout : un baril apparaît-il, deux joueurs se rencontrent-ils, combien de berries.

**La magie :** deux joueurs qui calculent le seed du bucket 14h zone "East Blue" obtiennent le **même seed**. Si Rayan recap à 18h et tire "rencontre Hakim au bucket 14h", quand Hakim recap à 19h son moteur tire le même seed → la même rencontre. **Le hasard est partagé sans table commune.**

| Alternative écartée                                    | Problème                                                |
| ------------------------------------------------------ | ------------------------------------------------------- |
| Random non-seedé                                       | Rayan voit "rencontre Hakim", Hakim ne le verra jamais. |
| Table `encounter` partagée écrite par le 1er qui recap | Couplage, race conditions, complexité.                  |
| Cron tick                                              | Marche mais réintroduit l'infra.                        |

## Deux types d'events

| Type         | Persistance                    | Décision joueur | Volume                  |
| ------------ | ------------------------------ | --------------- | ----------------------- |
| **Ambient**  | Aucune (juste trace `history`) | Non             | Beaucoup (1+/bucket)    |
| **Stateful** | Ligne `event_instance`         | Oui (boutons)   | Rare (1 max en attente) |

Exemples ambient : _"À 14h15 une vague a secoué ton navire (-2 moral)"_, _"À 14h30 ton équipage a aperçu une mouette"_. Affichés dans le recap, effets appliqués dans la transaction. Plus de ligne en base après.

Exemples stateful : _"Tu as repéré un baril. [Ouvrir] [Laisser]"_, _"Crocodile se dresse devant toi. [Attaquer] [Charger Haki]"_. Persistés tant que pas de clic.

> **Pourquoi cette séparation** : persister les ambient gonflerait `event_instance` pour rien. Ne pas persister les stateful permettrait au joueur de "rerouler" en re-recap (re-tirage du résultat à chaque vue).

> **Stateful** = qui porte un état entre recaps. **Ambient** = stateless, joué et oublié (sauf l'entrée `history`).
