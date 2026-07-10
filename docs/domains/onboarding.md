# Onboarding

L'onboarding est le parcours guidé d'un nouveau joueur. Tant qu'il dure, le moteur du monde est en pause (aucun event probabiliste généré) et le gate intercepte toute commande hors whitelist.

## État

L'état tient dans un seul champ :

```ts
player.onboarding_step;
```

- `null` → le joueur est libre, le monde tourne ;
- sinon → contient l'id du step courant. Le `default` DB est la première étape.

À la création du joueur, **aucun message n'est envoyé**. Le joueur tape (ou se cogne contre) le gate, qui lui affiche l'embed de l'étape avec un bouton « Continuer ».

---

## Script

Le parcours est déclaré dans `onboarding/scenario.ts` — un tableau ordonné. La transition vers le step suivant est implicite (élément suivant du tableau).

Deux types de steps :

### `scene`

Un embed scripté affiché tel quel, avec un bouton « Continuer ». Le clic appelle `advanceOnboarding` puis re-render le message avec la vue du step suivant (ou la vue de fin si c'était le dernier).

Chaque page de narration = un step à part entière (ex : `gold-roger-1`, `gold-roger-2`...). Pas de moteur d'event derrière : juste un embed + un bouton avec customId `onb-next:<stepId>`.

```ts
{ id: 'intro', type: 'scene', embed: buildIntroEmbed }
```

Une scène n'est pas limitée à un seul bouton **« Continuer »**. Si besoin, elle peut définir plusieurs boutons en implémentant `buildComponents` (optionnel sur `SceneStep`).

Par exemple, l'étape `storyteller-question` utilise cette possibilité pour afficher plusieurs réponses « flavor » (purement cosmétiques) en plus du bouton qui fait réellement avancer l'onboarding.

Les boutons « flavor » sont gérés par un handler dédié : ils modifient simplement le message affiché, sans changer la valeur de `onboardingStep`.

Le bouton qui permet de continuer réutilise quant à lui le custom ID `onb-next`. Il peut éventuellement ajouter un segment supplémentaire à ce custom ID afin de distinguer plusieurs boutons menant au même écran. Ce segment est ignoré par le handler `onb-next`, qui traite tous ces boutons de la même manière.

Voir `steps/step-storyteller.ts` pour un exemple concret.

### `mission`

Une commande riggée attendue. Le step déclare :

- `expects` → le nom de la commande attendue ;
- `matchesArgs` (optionnel) → au-delà du nom de commande, valide aussi les args tapés (ex : `info-mission` n'accepte que `!info oro jackson`) ;
- `run` → le handler riggé exécuté à la place du vrai (a accès à `tx`) ;
- `reminder` → l'embed affiché quand le joueur tape autre chose.

Le gate exécute `run` **puis `advanceOnboarding`, dans la même transaction** (même lock) — l'effet de `run` (ex : `resourceRepository.addResource`) et le passage au step suivant sont atomiques. Indispensable : sans ça, retaper la commande avant d'avoir cliqué "Continuer" relancerait `run` une deuxième fois (double objet obtenu).

Le message posté ne montre que **le résultat de `run`, avec un bouton Continuer** — pas encore la vue du step suivant. Ce bouton réutilise `onb-next` mais garde volontairement le **step d'avant l'avance** dans son customId : au clic, `onb-next` constate que ce n'est plus le step courant (déjà avancé) et prend sa branche « clic obsolète », qui se contente de re-render la vue actuelle. C'est le même mécanisme que pour une scene, détourné comme reveal en 2 temps plutôt que comme rattrapage de clic périmé.

```ts
{ id: 'fish-mission', type: 'mission', expects: 'fish', run: runFishStep, reminder: buildFishReminder }
```

---

## Vue partagée

`buildOnboardingView(player)` est synchrone, consommée par :

- le gate (commande bloquée, y compris `!recap`) ;
- le button handler `onb-next` (après advance).

Comportement :

- scene → embed + bouton Continuer ;
- mission → `step.reminder(player)`.

`buildOnboardingCompletedView()` est la vue affichée à la fin du parcours.

---

## Gate

`interceptOnboardingCommand` est appelé par le router avant l'auto-sync.

- la commande a `requiresOnboardingFinished: false` → pass-through (`!recap`, `_dev`). Le défaut est `true` (gated) ; `!intro` n'opt-out pas car c'est la commande attendue par la 1ʳᵉ mission. `!info` non plus : `info-mission` a besoin de l'intercepter (cf. `matchesArgs`) ;
- step `scene` → tout est bloqué, on renvoie `buildOnboardingView` ;
- step `mission` → seul `expects` (+ `matchesArgs` si présent) passe → `run` puis `advanceOnboarding` dans la même tx, résultat posté avec bouton Continuer (reveal, cf. plus haut) ; tout le reste → `step.reminder`.

Pendant la mission, on prend un `FOR UPDATE` sur le player et on re-vérifie la step avant d'exécuter `run` : deux commandes simultanées ne peuvent pas le déclencher deux fois.

---

## Button `onb-next`

Le clic sur Continuer fait :

1. `deferUpdate` ;
2. lock du player + re-check `onboardingStep === <stepId du customId>` ;
3. si match → `advanceOnboarding` en tx ;
4. si pas match → clic obsolète, on re-render simplement la vue courante.

Côté UX, si le joueur a plusieurs messages anciens avec un bouton Continuer obsolète, cliquer met le message à jour avec son état actuel (jamais d'avance accidentelle).

---

## World engine

`synchronizePlayer` early-return tant que `onboardingStep !== null`. Aucun event random n'est tiré pendant l'onboarding.

À la fin, `advanceOnboarding` repositionne `last_processed_bucket_id` au bucket courant pour éviter de rejouer tout l'historique d'un coup.

---

## Traçabilité

Chaque transition écrit `onboarding.stepCompleted` dans `history` (payload `{ step }`). La fin de parcours est implicite : c'est la complétion du dernier step.

---

## Ajouter ou réordonner une étape

1. Ajouter l'id dans `ONBOARDING_STEP_IDS` (package `db`) + migration enum PostgreSQL.
2. Selon le type :
   - `scene` → module `steps/step-<nom>.ts` qui exporte `(player) => EmbedBuilder`.
   - `mission` → module `steps/step-<nom>.ts` qui exporte `run` + `reminder`.
3. Insérer le step dans `ONBOARDING_SCENARIO`. `step-registry.ts` `throw` au boot si un id de l'enum n'a pas de step ou si des ids sont dupliqués.
