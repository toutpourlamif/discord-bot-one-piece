# Domaine : fishing

## Concept

La **pêche** est une action à la demande, déclenchée par le joueur via `!fishing`. Chaque lancer est **indépendant** : pas de niveau, pas d'XP, pas de mémoire entre deux lancers.

C'est la voie des joueurs pressés pour grappiller des bonus entre deux `!recap`, et un levier scénaristique pour la **main story**.

## Résultats possibles d'un lancer

Un lancer tire dans une table de loot pondérée. Issues actives dans cette itération :

| Résultat   | Détail                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| Rien       | Le lancer ne donne rien — issue normale, pas une erreur                                                   |
| `resource` | Matériau de craft générique, tiré parmi `resource_template WHERE is_quest_item = false` (voir `resource`) |
| Berry      | Gain direct, montant aléatoire (voir `economy`)                                                           |

Pondérations et montants configurés dans `apps/bot/src/domains/fishing/constants.ts`.

Hors scope de cette itération (voir roadmap) :

| Résultat             | Détail                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| Event déclenché      | Le lancer provoque un event qui s'enchaîne (voir `event`)                  |
| Avancée `main_story` | Trouvaille scénarisée : carte tombée à l'eau, fragment d'artefact `STORY`… |
| `character` (rare)   | Typiquement un **Homme-Poisson** qui rejoint la réserve (voir `character`) |

## Cadence

On a **10 lancers par heure** maximum. Le compteur est reset à chaque heure pile, ex: 14h00, 15h00… On le calcule depuis l'history du joueur

## Prérequis

N'importe quel joueur peut pêcher — pas d'item obligatoire côté code, ni de localisation particulière.

### Canne à pêche (objet de lore)

Pendant l'onboarding, un PNJ du tutoriel remet au joueur une **Canne à pêche**, stockée comme une entrée de `resource_template` (voir `resource`). Rôle purement narratif :

- non consommable, invendable,
- **aucun effet mécanique** — le code de pêche ne regarde pas sa présence,
- sert uniquement au RP et à justifier narrativement pourquoi le joueur sait pêcher.

## Amélioration via module navire

<!-- Hors scope de cette itération — le module `fishing_post` n'existe pas encore dans `SHIP_MODULE_KEYS`. -->

Pour booster la pêche (taux de loot, raretés accessibles, quota…), le joueur améliore un **module dédié du navire** : **Poste de pêche** — nom technique `fishing_post` (voir `ship`).

Contrairement aux autres modules qui se montent avec des ressources **génériques** (bois, fer, présence d'un charpentier…), le Poste de pêche coûte des **ressources spécifiques** créées pour lui, une par palier de niveau.

<!-- TODO: choisir les items d'évolution du Poste de pêche (un par niveau cible) — pistes : hameçon, hameçon en or, fil de fer… -->

Ces ressources spécifiques vivent dans `resource` comme n'importe quel matériau de type `CRAFT` et s'obtiennent :

- via **drop** (events marins, butin de pêche),
- via **achat** auprès de marchands d'île (voir `economy`).

## Pas d'implication de l'équipage

Aucun personnage de l'équipage n'intervient dans le calcul d'un lancer (pas de stat « pêche » côté `character` / `crew`). La pêche est une action purement joueur.

## Intégration main story

<!-- Hors scope de cette itération — voir roadmap. -->

Les déclencheurs scénaristiques sont modélisés côté `event` (catégories `main_story` / `side_quest`). Trois patterns typiques :

- quête « pêcher X poissons » (compteur de lancers fructueux),
- Homme-Poisson recrutable uniquement via un lancer scripté à une étape donnée,
- artefact `STORY` (carte au trésor tombée à l'eau, fragment…) obtenable seulement en pêchant à un moment précis.
