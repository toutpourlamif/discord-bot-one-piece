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

Le moteur prend des décisions aléatoires (un baril apparaît-il, combien de berries, deux joueurs se rencontrent-ils). On veut que ces tirages soient **rejouables** : deux exécutions du même bucket donnent le même résultat. Solution : un RNG initialisé par une graine (seed) calculée à partir de paramètres connus.

**Mais selon le type d'event, on partage ou pas le seed entre joueurs.** Chaque générateur déclare son `seedScope` :

| `seedScope` | Seed dérivé de        | Qui obtient le même tirage ?                     | Cas d'usage                                                 |
| ----------- | --------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| `'zone'`    | `(bucket_id, zone)`   | Tous les joueurs présents dans la zone au bucket | Rencontres, météo, événements partagés du monde             |
| `'player'`  | `(bucket_id, player)` | Toi seul                                         | Événements personnels (ton baril, mainstory, mouette perso) |

```ts
const seed = gen.seedScope === 'zone' ? hash(bucket_id, zone_id) : hash(bucket_id, player_id);
const rng = createRng(seed);
```

**La magie du `'zone'` :** deux joueurs qui calculent le seed du bucket 14h zone "East Blue" obtiennent le **même seed**. Si Rayan recap à 18h et tire "rencontre Hakim au bucket 14h", quand Hakim recap à 19h son moteur tire le même seed → la même rencontre. **Le hasard est partagé sans table commune.**

**Pourquoi `'player'` existe :** sinon Hakim et Rayan trouveraient tous les deux "un baril à 14h15 East Blue" et le ramasseraient tous les deux — c'est censé être une trouvaille perso, pas un événement du monde. Mixer `player_id` dans le seed isole le tirage à un joueur.

| Alternative écartée                                    | Problème                                                |
| ------------------------------------------------------ | ------------------------------------------------------- |
| Random non-seedé pour les events de zone               | Rayan voit "rencontre Hakim", Hakim ne le verra jamais. |
| Tout en seed `'player'`                                | Plus de rencontres, plus de monde partagé.              |
| Tout en seed `'zone'`                                  | Tout le monde trouve les mêmes barils perso.            |
| Table `encounter` partagée écrite par le 1er qui recap | Couplage, race conditions, complexité.                  |
| Cron tick                                              | Marche mais réintroduit l'infra.                        |

## Deux types d'events

Les deux passent par `event_instance` (la queue de ce que le joueur n'a pas encore consommé). Différences : timing des effets et nombre autorisé en file.

| Type            | Effets appliqués     | Nombre actif    | Décision joueur | Disparition de la queue    |
| --------------- | -------------------- | --------------- | --------------- | -------------------------- |
| **Passive**     | au calcul (engine)   | illimité        | Non             | clic "Suivant" → DELETE    |
| **Interactive** | au clic (résolution) | 1 max à la fois | Oui (boutons)   | clic sur un choix → DELETE |

Exemples passive : _"À 14h15 une vague a secoué ton navire (-2 moral)"_, _"À 14h30 ton équipage a aperçu une mouette"_. Effets appliqués pendant le `!recap` (état du joueur immédiatement à jour). La ligne `event_instance` ne sert qu'à différer l'affichage jusqu'à ce que le joueur clique "Suivant".

Exemples interactive : _"Tu as repéré un baril. [Ouvrir] [Laisser]"_, _"Crocodile se dresse devant toi. [Attaquer] [Charger Haki]"_. Pas d'effet tant que le joueur n'a pas choisi.

> **Pourquoi appliquer les passive au calcul** : si tu as perdu un membre d'équipage à 14h, il doit être perdu à 19h même si tu n'as pas encore cliqué through. L'état du joueur reflète toujours le passé calculé, indépendamment de la dette narrative restante.

> **Pourquoi un seul interactive actif** : rythme narratif. Tu vois → tu décides → tu continues, plutôt que 8 décisions balancées d'un coup. Le moteur s'arrête dès qu'il en tire un, le joueur résout, puis `!recap` reprend le calcul.

> **Interactive** = qui porte un état entre recaps. **Passive** = stateless une fois affiché.
