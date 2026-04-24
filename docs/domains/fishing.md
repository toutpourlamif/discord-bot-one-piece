# Domaine : fishing

## Concept

La **pêche** est une action à la demande, déclenchée par le joueur via `/pêcher`. Chaque lancer est **indépendant** : pas de niveau, pas d'XP, pas de mémoire entre deux lancers.

C'est la voie des joueurs pressés pour grappiller des bonus entre deux `/récap`, et un levier scénaristique pour la **main story**.

## Résultats possibles d'un lancer

Un lancer tire dans une table de loot pondérée. Les issues possibles :

| Résultat             | Détail                                                                         |
| -------------------- | ------------------------------------------------------------------------------ |
| Rien                 | Le lancer ne donne rien — issue normale, pas une erreur                        |
| `resource`           | Matériau de craft ou poisson consommable/vendable (voir `resource`, `economy`) |
| Berry                | Gain direct (voir `economy`)                                                   |
| Event déclenché      | Le lancer provoque un event qui s'enchaîne (voir `event`)                      |
| Avancée `main_story` | Trouvaille scénarisée : carte tombée à l'eau, fragment d'artefact `STORY`…     |
| `character` (rare)   | Typiquement un **Homme-Poisson** qui rejoint la réserve (voir `character`)     |

La table de loot et ses pondérations sont à la charge du domaine `fishing`.

## Cadence

Un **cooldown** limite le spam entre deux lancers.

<!-- TODO: définir la durée exacte du cooldown et d'éventuels quotas -->

## Prérequis

N'importe quel joueur peut pêcher — pas d'item obligatoire ni de localisation particulière.

<!-- TODO: réfléchir à une manière d'augmenter la pêche — probablement un module de navire (voir `ship`) qui booste la table de loot et/ou réduit le cooldown -->

## Pas d'implication de l'équipage

Aucun personnage de l'équipage n'intervient dans le calcul d'un lancer (pas de stat « pêche » côté `character` / `crew`). La pêche est une action purement joueur.

## Intégration main story

Les déclencheurs scénaristiques sont modélisés côté `event` (catégories `main_story` / `side_quest`). Trois patterns typiques :

- quête « pêcher X poissons » (compteur de lancers fructueux),
- Homme-Poisson recrutable uniquement via un lancer scripté à une étape donnée,
- artefact `STORY` (carte au trésor tombée à l'eau, fragment…) obtenable seulement en pêchant à un moment précis.
